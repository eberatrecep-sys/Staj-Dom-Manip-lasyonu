namespace MyShoppingApp.Application.Interfaces;

public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to the storage and returns the generated URL.
    /// </summary>
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);

    /// <summary>
    /// Deletes a file from the storage.
    /// </summary>
    Task DeleteFileAsync(string fileUrl);
}
