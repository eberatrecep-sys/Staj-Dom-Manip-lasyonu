using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _publicUrlPrefix;

    public FileStorageService(IConfiguration configuration)
    {
        var accessKey = configuration["S3:AccessKey"];
        var secretKey = configuration["S3:SecretKey"];
        var serviceUrl = configuration["S3:ServiceUrl"]; // MinIO URL e.g. http://127.0.0.1:9000
        _bucketName = configuration["S3:BucketName"] ?? "myshoppingapp";
        _publicUrlPrefix = configuration["S3:PublicUrlPrefix"] ?? $"{serviceUrl}/{_bucketName}/";

        var config = new AmazonS3Config
        {
            ServiceURL = serviceUrl,
            ForcePathStyle = true // Required for MinIO
        };

        _s3Client = new AmazonS3Client(accessKey, secretKey, config);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        
        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = uniqueFileName,
            InputStream = fileStream,
            ContentType = contentType
        };

        await _s3Client.PutObjectAsync(request);

        return $"{_publicUrlPrefix.TrimEnd('/')}/{uniqueFileName}";
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) return;

        // Extract key from URL
        var key = fileUrl.Split('/').LastOrDefault();
        if (string.IsNullOrEmpty(key)) return;

        var request = new DeleteObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        await _s3Client.DeleteObjectAsync(request);
    }

    public async Task<Stream> GetFileStreamAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) throw new ArgumentException("fileUrl cannot be null");
        
        var key = fileUrl.Split('/').LastOrDefault();
        if (string.IsNullOrEmpty(key)) throw new ArgumentException("Invalid fileUrl");

        var request = new GetObjectRequest
        {
            BucketName = _bucketName,
            Key = key
        };

        var response = await _s3Client.GetObjectAsync(request);
        return response.ResponseStream;
    }
}
