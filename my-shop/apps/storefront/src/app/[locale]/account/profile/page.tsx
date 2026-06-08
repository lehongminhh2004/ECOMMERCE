import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getActiveCustomer } from '@/lib/vendure/actions';
import { getRouteLocale } from '@/i18n/server';
import { SavedCoupons } from '@/components/account/saved-coupons';
import { ChangePasswordForm } from './change-password-form';
import { EditEmailForm } from './edit-email-form';
import { EditProfileForm } from './edit-profile-form';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Account' });
    return {
        title: t('profilePageTitle'),
    };
}

export default async function ProfilePage() {
    const customer = await getActiveCustomer();
    const locale = await getRouteLocale();
    const t = await getTranslations({ locale, namespace: 'Account' });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{t('profile')}</h1>
                <p className="text-muted-foreground mt-2">
                    {t('manageAccountInfo')}
                </p>
            </div>

            <EditProfileForm customer={customer} />

            <EditEmailForm currentEmail={customer?.emailAddress || ''} />

            <ChangePasswordForm />

            <div className="border rounded-xl p-6 bg-card space-y-4">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        🎟️ {t('savedDiscountCodes')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('savedDiscountCodesDescription')}
                    </p>
                </div>
                <SavedCoupons />
            </div>
        </div>
    );
}
