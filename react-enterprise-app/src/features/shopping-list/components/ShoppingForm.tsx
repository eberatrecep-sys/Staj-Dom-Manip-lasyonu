import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const ShoppingForm = () => {
    const { t } = useTranslation();

    const schema = z.object({
        productName: z.string().min(1, { message: t('errors.product_required') }),
        quantity: z.number({ message: t('errors.quantity_required') })
            .int({ message: t('errors.quantity_integer') })
            .positive({ message: t('errors.quantity_positive') })
    });

    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const onSubmit = (data: FormData) => {
        console.log("Form Verisi:", data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
            <div>
                <label>{t('product_name')}</label>
                <input
                    {...register('productName')}
                    style={{ borderColor: errors.productName ? 'red' : 'initial', width: '100%', padding: '0.5rem' }}
                />
                {errors.productName && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.productName.message}</span>}
            </div>

            <div>
                <label>{t('quantity')}</label>
                <input
                    type="number"
                    {...register('quantity', { valueAsNumber: true })}
                    style={{ borderColor: errors.quantity ? 'red' : 'initial', width: '100%', padding: '0.5rem' }}
                />
                {errors.quantity && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.quantity.message}</span>}
            </div>

            <button type="submit">{t('add_button')}</button>
        </form>
    );
};
