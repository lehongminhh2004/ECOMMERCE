/**
 * Script tạo Promotions (mã giảm giá) trong Vendure Admin API
 * 
 * Chạy: npx ts-node src/scripts/create-promotions.ts
 * hoặc: node dist/scripts/create-promotions.js
 */

const VENDURE_ADMIN_API = process.env.VENDURE_ADMIN_API || 'http://localhost:3000/admin-api';
const ADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'superadmin';

async function gqlRequest(query: string, variables?: Record<string, unknown>, authToken?: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(VENDURE_ADMIN_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    const json = await res.json() as { data?: unknown; errors?: Array<{ message: string }> };
    if (json.errors) {
        throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
    }
    return json.data as Record<string, unknown>;
}

async function login(): Promise<string> {
    const data = await gqlRequest(`
        mutation Login($username: String!, $password: String!) {
            login(username: $username, password: $password) {
                ... on CurrentUser {
                    id
                    identifier
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `, { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const login = (data as { login: { id?: string; errorCode?: string; message?: string } }).login;
    if (!login.id) {
        throw new Error(`Login failed: ${login.message || login.errorCode}`);
    }

    // Get auth token from response headers — Vendure uses cookie/bearer
    // For script usage, we'll use the loginWithToken approach
    // Instead, just return identifier as token placeholder for now
    // The login mutation sets the session, so subsequent calls will work via session
    console.log(`✅ Logged in as: ${login.id}`);
    return ''; // session-based auth
}

async function getAuthToken(): Promise<string> {
    const res = await fetch(VENDURE_ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `
                mutation Login($u: String!, $p: String!) {
                    login(username: $u, password: $p) {
                        ... on CurrentUser { id identifier }
                        ... on ErrorResult { errorCode message }
                    }
                }
            `,
            variables: { u: ADMIN_USERNAME, p: ADMIN_PASSWORD },
        }),
    });

    // Extract token from Authorization header in response
    const authHeader = res.headers.get('vendure-auth-token');
    const json = await res.json() as { data?: { login?: { id?: string } }; errors?: Array<{ message: string }> };

    if (json.errors) throw new Error(json.errors[0].message);
    if (!json.data?.login?.id) throw new Error('Login failed');

    console.log(`✅ Đăng nhập thành công - ID: ${json.data.login.id}`);

    if (authHeader) {
        console.log(`🔑 Token nhận được từ header`);
        return authHeader;
    }

    // Try to get token from login body
    console.log('ℹ️  Sử dụng session-based auth (no token in header)');
    return '';
}

async function createPromotion(authToken: string, promotion: {
    name: string;
    couponCode?: string;
    description?: string;
    conditions: Array<{ code: string; arguments: Array<{ name: string; value: string }> }>;
    actions: Array<{ code: string; arguments: Array<{ name: string; value: string }> }>;
}) {
    const data = await gqlRequest(`
        mutation CreatePromotion($input: CreatePromotionInput!) {
            createPromotion(input: $input) {
                ... on Promotion {
                    id
                    name
                    couponCode
                    enabled
                    conditions {
                        code
                    }
                    actions {
                        code
                    }
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `, {
        input: {
            name: promotion.name,
            couponCode: promotion.couponCode,
            description: promotion.description,
            enabled: true,
            conditions: promotion.conditions,
            actions: promotion.actions,
            startsAt: null,
            endsAt: null,
        }
    }, authToken) as { createPromotion?: { id?: string; name?: string; couponCode?: string; errorCode?: string; message?: string } };

    const result = data.createPromotion;
    if (result?.errorCode) {
        console.error(`❌ Lỗi tạo promotion "${promotion.name}": ${result.message}`);
        return null;
    }

    return result;
}

async function listExistingPromotions(authToken: string) {
    const data = await gqlRequest(`
        query {
            promotions {
                items {
                    id
                    name
                    couponCode
                    enabled
                }
                totalItems
            }
        }
    `, {}, authToken) as { promotions?: { items: Array<{ id: string; name: string; couponCode: string | null; enabled: boolean }>; totalItems: number } };

    return data.promotions?.items || [];
}

async function main() {
    console.log('\n🚀 Bắt đầu tạo Promotions trong Vendure Admin...\n');
    console.log(`📡 API URL: ${VENDURE_ADMIN_API}`);
    console.log(`👤 Tài khoản: ${ADMIN_USERNAME}\n`);

    // Login
    const authToken = await getAuthToken();

    // Kiểm tra promotions đã có
    console.log('\n📋 Kiểm tra các promotions hiện có...');
    const existing = await listExistingPromotions(authToken);
    const existingCodes = existing.map(p => p.couponCode).filter(Boolean);
    console.log(`Tìm thấy ${existing.length} promotion(s):`, existing.map(p => `${p.name} (${p.couponCode || 'no code'})`).join(', ') || 'Không có');

    // Định nghĩa các promotions cần tạo
    const promotionsToCreate = [
        {
            name: 'Giảm 20% Toàn Đơn - SALE20',
            couponCode: 'SALE20',
            description: 'Giảm 20% cho toàn bộ đơn hàng khi nhập mã SALE20',
            conditions: [], // Không có điều kiện - áp dụng cho tất cả
            actions: [
                {
                    code: 'order_percentage_discount',
                    arguments: [
                        { name: 'discount', value: '20' }
                    ]
                }
            ]
        },
        {
            name: 'Giảm 30% Toàn Đơn - SALE30',
            couponCode: 'SALE30',
            description: 'Giảm 30% cho toàn bộ đơn hàng khi nhập mã SALE30',
            conditions: [],
            actions: [
                {
                    code: 'order_percentage_discount',
                    arguments: [
                        { name: 'discount', value: '30' }
                    ]
                }
            ]
        },
        {
            name: 'Giảm 50% Toàn Đơn - SALE50',
            couponCode: 'SALE50',
            description: 'Giảm 50% cho toàn bộ đơn hàng khi nhập mã SALE50',
            conditions: [],
            actions: [
                {
                    code: 'order_percentage_discount',
                    arguments: [
                        { name: 'discount', value: '50' }
                    ]
                }
            ]
        },
        {
            name: 'Miễn Phí Vận Chuyển - FREESHIP',
            couponCode: 'FREESHIP',
            description: 'Miễn phí vận chuyển khi nhập mã FREESHIP',
            conditions: [],
            actions: [
                {
                    code: 'free_shipping',
                    arguments: []
                }
            ]
        },
    ];

    // Tạo từng promotion
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const promo of promotionsToCreate) {
        if (promo.couponCode && existingCodes.includes(promo.couponCode)) {
            console.log(`⏭️  Bỏ qua "${promo.name}" (mã "${promo.couponCode}" đã tồn tại)`);
            skipped++;
            continue;
        }

        console.log(`\n📝 Tạo promotion: "${promo.name}" (mã: ${promo.couponCode || 'không có'})...`);
        const result = await createPromotion(authToken, promo);

        if (result && result.id) {
            console.log(`✅ Tạo thành công! ID: ${result.id}, Coupon: ${result.couponCode}`);
            created++;
        } else {
            failed++;
        }

        // Delay nhỏ giữa các requests
        await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 KẾT QUẢ:');
    console.log(`   ✅ Tạo thành công: ${created}`);
    console.log(`   ⏭️  Đã tồn tại:    ${skipped}`);
    console.log(`   ❌ Thất bại:       ${failed}`);
    console.log('═══════════════════════════════════════');

    if (created > 0) {
        console.log('\n🎉 Các mã giảm giá đã sẵn sàng sử dụng:');
        promotionsToCreate.forEach(p => {
            if (p.couponCode) {
                console.log(`   → ${p.couponCode.padEnd(12)} : ${p.description}`);
            }
        });
    }

    console.log('\n💡 Kiểm tra tại Vendure Admin: http://localhost:3000/dashboard\n');
}

main().catch((err) => {
    console.error('\n❌ Lỗi:', err.message);
    console.log('\n⚠️  Đảm bảo Vendure server đang chạy tại', VENDURE_ADMIN_API);
    console.log('   Chạy: npm run dev:server\n');
    process.exit(1);
});
