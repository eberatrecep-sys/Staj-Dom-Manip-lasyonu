using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyShoppingApp.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task SendBulkEmailAsync(IEnumerable<string> toList, string subject, string body, bool isHtml = true);
}
