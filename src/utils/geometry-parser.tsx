import * as THREE from 'three';

export interface ParsedGeometry {
  parts: Array<{
    id: string;
    name: string;
    meshes: Array<{
      vertices: number[];
      normals: number[];
      indices?: number[];
      faceIndex: number;
      color: string;
      alpha: number;
    }>;
    edges: number[];
    wireframeColor: string;
  }>;
  boundingBox: {
    min: THREE.Vector3;
    max: THREE.Vector3;
    center: THREE.Vector3;
    size: THREE.Vector3;
  };
  stats: {
    totalParts: number;
    totalFaces: number;
    totalVertices: number;
    totalTriangles: number;
    totalEdges: number;
  };
}

export class GeometryParser {
  static parse(geometryData: any): ParsedGeometry {
    
    if (!geometryData || typeof geometryData !== 'object') {
      return this.createFallback();
    }

    const parts = this.extractParts(geometryData);
    const parsedParts = parts.map((part, index) => this.parsePart(part, index));
    
    return {
      parts: parsedParts,
      boundingBox: this.calculateBoundingBox(parsedParts),
      stats: this.calculateStats(parsedParts)
    };
  }

   /**
   * Extracts parts from the raw geometry data by checking common property names.
   * Falls back to a single basic part if no match is found.
   */
  private static extractParts(data: any): any[] {
    for (const key of ['parts', 'objects', 'meshes', 'geometries', 'shapes']) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        return data[key];
      }
    }
    
    // If data itself has geometry, treat as single part
    if (this.hasGeometryData(data)) {
      return [data];
    }
    
    return [this.createBasicPart()];
  }

  /**
   * Checks if an object contains geometry-related arrays (vertices, faces, etc.).
  */
  private static hasGeometryData(obj: any): boolean {
    return ['vertices', 'triangles', 'faces', 'indices', 'positions']
      .some(key => Array.isArray(obj[key]) && obj[key].length > 0);
  }

  /**
   * Parses a single part's geometry and metadata into the ParsedGeometry format.
  */
  private static parsePart(part: any, index: number): ParsedGeometry['parts'][0] {
    const id = part.id || part.name || `part_${index}`;
    const name = part.name || part.id || `Part ${index}`;
    
    // Get geometry data
    const vertices = this.getArray(part, ['vertices', 'positions', 'coords']) || [];
    const triangles = this.getArray(part, ['triangles', 'indices', 'faces']) || [];
    const normals = this.getArray(part, ['normals', 'vertex_normals']) || 
                   this.generateNormals(vertices, triangles);
    
    // Create meshes - group by faces if available
    const faceGroups = this.getFaceGroups(part, triangles);
    const meshes = this.createMeshes(vertices, triangles, normals, faceGroups, part);
    
    // Generate edges
    const edges = this.getArray(part, ['edges', 'wireframe']) || 
                  this.generateEdges(vertices, triangles);
    
    return {
      id,
      name,
      meshes,
      edges,
      wireframeColor: this.getColor(part.wireframeColor) || '#333333'
    };
  }

  private static getArray(obj: any, keys: string[]): number[] | null {
    for (const key of keys) {
      const value = obj[key] || obj.shape?.[key] || obj.geometry?.[key];
      if (Array.isArray(value) && value.length > 0) {
        return value.map(v => typeof v === 'number' ? v : 0);
      }
    }
    return null;
  }

  /**
  * Creates face groups from triangles to help split meshes logically.
  * If no group info is provided, defaults to grouping by quads.
  */
  private static getFaceGroups(part: any, triangles: number[]): Array<{start: number, count: number}> {
    const trianglesPerFace = this.getArray(part, ['triangles_per_face', 'faceCounts']);
    
    if (trianglesPerFace) {
      let start = 0;
      return trianglesPerFace.map(count => {
        const group = { start, count: Math.max(1, count) };
        start += group.count;
        return group;
      });
    }
    
    // Default: group every 2 triangles (common for quads)
    const totalTriangles = triangles.length / 3;
    const groups = [];
    for (let i = 0; i < totalTriangles; i += 2) {
      groups.push({ start: i, count: Math.min(2, totalTriangles - i) });
    }
    return groups;
  }

  /**
  * Builds mesh objects for each face group, including vertices, normals, color, and alpha.
  */
  private static createMeshes(
    vertices: number[], 
    triangles: number[], 
    normals: number[], 
    faceGroups: Array<{start: number, count: number}>,
    part: any
  ): ParsedGeometry['parts'][0]['meshes'] {
    const baseColor = this.getColor(part.color) || '#e8b024';
    const alpha = typeof part.alpha === 'number' ? part.alpha : 1.0;
    
    return faceGroups.map((group, faceIndex) => {
      const faceVertices: number[] = [];
      const faceNormals: number[] = [];
      
      for (let i = 0; i < group.count; i++) {
        const triangleIndex = (group.start + i) * 3;
        
        for (let j = 0; j < 3; j++) {
          const vertexIndex = triangles[triangleIndex + j] * 3;
          
          // Add vertex
          faceVertices.push(
            vertices[vertexIndex] || 0,
            vertices[vertexIndex + 1] || 0,
            vertices[vertexIndex + 2] || 0
          );
          
          // Add normal
          faceNormals.push(
            normals[vertexIndex] || 0,
            normals[vertexIndex + 1] || 0,
            normals[vertexIndex + 2] || 1
          );
        }
      }
      
      return {
        vertices: faceVertices,
        normals: faceNormals,
        faceIndex,
        color: baseColor,
        alpha: Math.max(0, Math.min(1, alpha))
      };
    });
  }

  private static generateNormals(vertices: number[], triangles: number[]): number[] {
    const normals = new Array(vertices.length).fill(0);
    
    for (let i = 0; i < triangles.length; i += 3) {
      const [i1, i2, i3] = [triangles[i] * 3, triangles[i + 1] * 3, triangles[i + 2] * 3];
      
      if (i3 + 2 >= vertices.length) continue;
      
      const v1 = new THREE.Vector3(vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
      const v2 = new THREE.Vector3(vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
      const v3 = new THREE.Vector3(vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);
      
      const normal = v2.clone().sub(v1).cross(v3.clone().sub(v1)).normalize();
      
      [i1, i2, i3].forEach(idx => {
        normals[idx] += normal.x;
        normals[idx + 1] += normal.y;
        normals[idx + 2] += normal.z;
      });
    }
    
    // Normalize accumulated normals
    for (let i = 0; i < normals.length; i += 3) {
      const length = Math.sqrt(normals[i]**2 + normals[i + 1]**2 + normals[i + 2]**2);
      if (length > 0) {
        normals[i] /= length;
        normals[i + 1] /= length;
        normals[i + 2] /= length;
      } else {
        normals[i] = 0;
        normals[i + 1] = 0;
        normals[i + 2] = 1;
      }
    }
    
    return normals;
  }

  /**
   * Generates a list of unique edges from triangles to represent wireframe lines.
  */
  private static generateEdges(vertices: number[], triangles: number[]): number[] {
    const edges: number[] = [];
    const edgeSet = new Set<string>();
    
    for (let i = 0; i < triangles.length; i += 3) {
      const [v1, v2, v3] = [triangles[i], triangles[i + 1], triangles[i + 2]];
      
      [[v1, v2], [v2, v3], [v3, v1]].forEach(([a, b]) => {
        const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push(
            vertices[a * 3] || 0, vertices[a * 3 + 1] || 0, vertices[a * 3 + 2] || 0,
            vertices[b * 3] || 0, vertices[b * 3 + 1] || 0, vertices[b * 3 + 2] || 0
          );
        }
      });
    }
    
    return edges;
  }

  private static getColor(color: any): string {
    if (typeof color === 'string' && color.startsWith('#')) return color;
    if (Array.isArray(color) && color.length >= 3) {
      const [r, g, b] = color.map(c => Math.round(Math.max(0, Math.min(1, c)) * 255));
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return null;
  }

  private static calculateBoundingBox(parts: ParsedGeometry['parts']): ParsedGeometry['boundingBox'] {
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    
    parts.forEach(part => {
      part.meshes.forEach(mesh => {
        for (let i = 0; i < mesh.vertices.length; i += 3) {
          min.x = Math.min(min.x, mesh.vertices[i]);
          min.y = Math.min(min.y, mesh.vertices[i + 1]);
          min.z = Math.min(min.z, mesh.vertices[i + 2]);
          max.x = Math.max(max.x, mesh.vertices[i]);
          max.y = Math.max(max.y, mesh.vertices[i + 1]);
          max.z = Math.max(max.z, mesh.vertices[i + 2]);
        }
      });
    });
    
    if (!isFinite(min.x)) {
      min.set(-1, -1, -1);
      max.set(1, 1, 1);
    }
    
    return {
      min,
      max,
      center: min.clone().add(max).multiplyScalar(0.5),
      size: max.clone().sub(min)
    };
  }

  private static calculateStats(parts: ParsedGeometry['parts']): ParsedGeometry['stats'] {
  const quant = (n: number) => Math.round(n * 1e6); // 1e-6 tolerance

  const uniqueVerticesPerPart = (part: ParsedGeometry['parts'][0]) => {
    const set = new Set<string>();

    if (part.edges && part.edges.length >= 6) {
      // Prefer edges: endpoints cover all used vertices without per-face duplication
      for (let i = 0; i < part.edges.length; i += 6) {
        const x1 = part.edges[i],     y1 = part.edges[i + 1], z1 = part.edges[i + 2];
        const x2 = part.edges[i + 3], y2 = part.edges[i + 4], z2 = part.edges[i + 5];
        set.add(`${quant(x1)},${quant(y1)},${quant(z1)}`);
        set.add(`${quant(x2)},${quant(y2)},${quant(z2)}`);
      }
    } else {
      // Fallback: de-dup across all mesh vertices
      part.meshes.forEach(m => {
        for (let i = 0; i < m.vertices.length; i += 3) {
          const x = m.vertices[i], y = m.vertices[i + 1], z = m.vertices[i + 2];
          set.add(`${quant(x)},${quant(y)},${quant(z)}`);
        }
      });
    }

    return set.size;
  };

  return parts.reduce((stats, part) => {
    const faces = part.meshes.length;

    const trisInMeshes = part.meshes.reduce((sum, mesh) => sum + (mesh.vertices.length / 9), 0);

    const uniqueVerts = uniqueVerticesPerPart(part);

    const edgeCount = (part.edges?.length ?? 0) / 6; 

    return {
      totalParts: stats.totalParts + 1,
      totalFaces: stats.totalFaces + faces,
      totalVertices: stats.totalVertices + uniqueVerts,
      totalTriangles: stats.totalTriangles + trisInMeshes,
      totalEdges: stats.totalEdges + edgeCount
    };
  }, { totalParts: 0, totalFaces: 0, totalVertices: 0, totalTriangles: 0, totalEdges: 0 });
}


  private static createFallback(): ParsedGeometry {
    return {
      parts: [{
        id: 'fallback',
        name: 'Fallback Geometry',
        meshes: [{
          vertices: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0],
          normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
          faceIndex: 0,
          color: '#ff6b6b',
          alpha: 1.0
        }],
        edges: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0, 0, 0.5, 0, -0.5, -0.5, 0],
        wireframeColor: '#333333'
      }],
      boundingBox: {
        min: new THREE.Vector3(-0.5, -0.5, 0),
        max: new THREE.Vector3(0.5, 0.5, 0),
        center: new THREE.Vector3(0, 0, 0),
        size: new THREE.Vector3(1, 1, 0)
      },
      stats: { totalParts: 1, totalFaces: 1, totalVertices: 3, totalTriangles: 1 }
    };
  }

  private static createBasicPart(): any {
    return {
      vertices: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0, 0.5, 0],
      triangles: [0, 1, 2],
      color: '#e8b024'
    };
  }
}