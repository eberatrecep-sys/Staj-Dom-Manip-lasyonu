using FluentValidation;
using MyShoppingApp.Application.DTOs.ShoppingList;

namespace MyShoppingApp.Application.Validators;

public class CreateListDtoValidator : AbstractValidator<CreateListDto>
{
    public CreateListDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Başlık alanı boş bırakılamaz.")
            .MaximumLength(100).WithMessage("Başlık en fazla 100 karakter olmalıdır.");
            
        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Kategori zorunludur.");
    }
}
