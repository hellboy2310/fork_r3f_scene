export interface GeometryShape {
  vertices: number[];
  triangles: number[];
  normals: number[];
  edges: number[];
  obj_vertices: number[];
  face_types: number[];
  edge_types: number[];
  triangles_per_face: number[];
  segments_per_edge: number[];
}

export interface GeometryPart {
  id: string;
  type: string;
  subtype: string;
  name: string;
  shape: GeometryShape;
  state: number[];
  color: string;
  alpha: number;
  texture: any;
  loc: number[][];
  renderback: boolean;
  accuracy: any;
  bb: any;
}

export interface BoundingBox {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  zmin: number;
  zmax: number;
}

export interface GeometryData {
  version: number;
  parts: GeometryPart[];
  loc: number[][];
  name: string;
  id: string;
  normal_len: number;
  bb: BoundingBox;
}

export interface GeometryStats {
  faces: number;
  edges: number;
  vertices: number;
  triangles: number;
}
