import {getActiveChannel} from '@/lib/vendure/actions';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {CurrencyPicker} from './currency-picker';

// Intentionally dynamic: the route locale wins over stale currency cookies
// after the user switches between English and Vietnamese.
export async function CurrencyPickerWrapper({locale}: {locale: string}) {
    const channel = await getActiveChannel();
    const activeCurrency = await getActiveCurrencyCode(locale);

    return (
        <CurrencyPicker
            availableCurrencyCodes={channel.availableCurrencyCodes}
            activeCurrencyCode={activeCurrency}
        />
    );
}
