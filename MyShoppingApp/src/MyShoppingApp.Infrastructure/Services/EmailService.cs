using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using MyShoppingApp.Application.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyShoppingApp.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("MyShoppingApp", _configuration["SmtpSettings:SenderEmail"] ?? "no-reply@myshoppingapp.com"));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder();
        if (isHtml)
        {
            bodyBuilder.HtmlBody = body;
        }
        else
        {
            bodyBuilder.TextBody = body;
        }

        message.Body = bodyBuilder.ToMessageBody();

        await SendMessageAsync(message);
    }

    public async Task SendBulkEmailAsync(IEnumerable<string> toList, string subject, string body, bool isHtml = true)
    {
        // For simple implementation, we can send to BCC to avoid exposing emails to everyone
        // Or loop and send individually. Sending individually ensures better deliverability.
        
        using var client = new SmtpClient();
        await client.ConnectAsync(_configuration["SmtpSettings:Server"] ?? "smtp.example.com", int.Parse(_configuration["SmtpSettings:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_configuration["SmtpSettings:Username"] ?? "", _configuration["SmtpSettings:Password"] ?? "");

        foreach (var to in toList)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("MyShoppingApp", _configuration["SmtpSettings:SenderEmail"] ?? "no-reply@myshoppingapp.com"));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            if (isHtml)
            {
                bodyBuilder.HtmlBody = body;
            }
            else
            {
                bodyBuilder.TextBody = body;
            }

            message.Body = bodyBuilder.ToMessageBody();

            await client.SendAsync(message);
        }

        await client.DisconnectAsync(true);
    }

    private async Task SendMessageAsync(MimeMessage message)
    {
        using var client = new SmtpClient();
        await client.ConnectAsync(_configuration["SmtpSettings:Server"] ?? "smtp.example.com", int.Parse(_configuration["SmtpSettings:Port"] ?? "587"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_configuration["SmtpSettings:Username"] ?? "", _configuration["SmtpSettings:Password"] ?? "");
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
