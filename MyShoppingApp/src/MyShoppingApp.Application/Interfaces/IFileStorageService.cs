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

    /// <summary>
    /// Gets the file stream from the storage.
    /// </summary>
    Task<Stream> GetFileStreamAsync(string fileUrl);
}
