import fs from "fs";
import path from "path";
import config from "../configs/app.config";

export const uploadFile = async (file, uploadDir, fileName) => {
    const BASE_UPLOAD_DIR = path.join(process.cwd(), "public");
    const userUploadDir = path.join(BASE_UPLOAD_DIR, uploadDir);
    
    // Ensure user directory exists
    if (!fs.existsSync(userUploadDir)) {
        fs.mkdirSync(userUploadDir, { recursive: true });
    }
    
    // Final File Path
    const filePath = path.join(userUploadDir, fileName);
    
    // Save file to server
    fs.writeFileSync(filePath, file.buffer);

    return `${config.get('user_backend_app_url')}/${uploadDir}/${fileName}`;
}

export const deleteFile = async (fileUrl) => {
    try {
        // Extract file path from the URL
        const BASE_UPLOAD_DIR = path.join(process.cwd(), "public");
        const relativePath = new URL(fileUrl).pathname; // Extracts "/rankLogo/filename.jpg"
        const filePath = path.join(BASE_UPLOAD_DIR, decodeURIComponent(relativePath));

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return { success: true, message: "File removed successfully" };
        } else {
            return { success: false, message: "File not found" };
        }
    } catch (error) {
        return { success: false, message: "Error removing file", error };
    }
};
