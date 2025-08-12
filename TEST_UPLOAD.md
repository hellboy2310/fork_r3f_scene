# Test Upload Script

This script can be used to test the file upload functionality.

## Test with curl

```bash
# Test the health endpoint
curl http://localhost:8000/health

# Test file upload (you'll need a .step or .stp file)
curl -X POST "http://localhost:8000/upload" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@/path/to/your/file.step"
```

## Test with the UI

1. Navigate to http://localhost:3000
2. Open the Control Panel (should be visible on the left side)
3. Click on "Import CAD" under the Geometry section
4. Select or drag a .step or .stp file
5. Click Upload

## Expected Behavior

- Valid .step/.stp files should upload successfully
- Invalid files should show appropriate error messages
- Upload progress should be shown with a spinner
- Success state should display with the uploaded filename
- Dialog should auto-close after successful upload

## Files Structure

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Uploaded files are saved to: `/home/asepahvand/repos/r3f_scene/backend/uploads/`
