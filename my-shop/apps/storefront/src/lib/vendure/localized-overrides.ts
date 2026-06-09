type TextOverride = {
    name: string;
    description?: string;
};

type CollectionLike = {
    slug?: string;
    name?: string;
};

type ProductLike = {
    slug?: string;
    name?: string;
    productName?: string;
    description?: string;
    collections?: CollectionLike[];
};

const viCollections: Record<string, TextOverride> = {
    electronics: {name: 'Điện tử'},
    computers: {name: 'Máy tính'},
    furniture: {name: 'Nội thất'},
    equipment: {name: 'Thiết bị'},
    footwear: {name: 'Giày dép'},
    plants: {name: 'Cây cảnh'},
    'camera-photo': {name: 'Máy ảnh & Nhiếp ảnh'},
    'home-garden': {name: 'Nhà cửa & Sân vườn'},
    'sports-outdoor': {name: 'Thể thao & Ngoài trời'},
};

const viProducts: Record<string, TextOverride> = {
    laptop: {
        name: 'Máy tính xách tay',
        description: 'Được trang bị bộ xử lý Intel Core thế hệ thứ bảy, chiếc laptop này phản hồi nhanh hơn bao giờ hết. Từ các tác vụ hằng ngày như mở ứng dụng, truy cập tệp cho đến xử lý công việc nâng cao, ổ SSD tốc độ cao và Turbo Boost lên đến 3.6GHz giúp bạn làm việc trọn ngày.',
    },
    tablet: {
        name: 'Máy tính bảng',
        description: 'Nếu máy tính được phát minh vào hôm nay, nó sẽ mạnh mẽ cho mọi tác vụ, đủ cơ động để mang đi khắp nơi và trực quan để dùng theo bất cứ cách nào bạn muốn: chạm, bàn phím hoặc bút cảm ứng. Nói cách khác, đó chính là máy tính bảng.',
    },
    'cordless-mouse': {
        name: 'Chuột quang không dây',
        description: 'Chuột quang không dây Logitech M185 là lựa chọn gọn gàng cho mọi người dùng máy tính. Với độ ổn định quen thuộc của Logitech, đây là một mẫu chuột đáng tin cậy cho công việc hằng ngày.',
    },
    '32-inch-monitor': {
        name: 'Màn hình 32 inch',
        description: 'Màn hình UJ59 với độ phân giải Ultra HD có số điểm ảnh gấp 4 lần Full HD, mang lại không gian hiển thị rộng và hình ảnh sống động. Bạn có thể xem tài liệu, trang web, làm việc đa cửa sổ và thưởng thức ảnh, video, game ở chất lượng 4K.',
    },
    'curvy-monitor': {
        name: 'Màn hình cong',
        description: 'Trải nghiệm hiển thị đắm chìm với màn hình cong ôm theo tầm nhìn. Thiết kế 1,800R mở rộng góc nhìn, tăng chiều sâu và giảm xao nhãng ở rìa màn hình để bạn tập trung hơn vào nội dung.',
    },
    'high-performance-ram': {
        name: 'RAM hiệu năng cao',
        description: 'Mỗi thanh RAM sử dụng tản nhiệt nhôm nguyên khối để giải nhiệt nhanh và vận hành mát hơn. Hỗ trợ cấu hình XMP 2.0 cho khả năng ép xung tốt, tương thích nhiều nền tảng Intel và AMD phổ biến.',
    },
    'gaming-pc': {
        name: 'PC chơi game',
        description: 'Bộ PC được tối ưu cho chơi game và sẵn sàng cho VR. CPU Intel Core i7 cùng GPU hiệu năng cao đem lại sức mạnh xử lý cần thiết cho trải nghiệm mượt mà.',
    },
    'hard-drive': {
        name: 'Ổ cứng',
        description: 'Nâng cấp dung lượng lưu trữ cho PC với ổ cứng gắn trong, phù hợp cho máy tính để bàn và máy tính all-in-one.',
    },
    'clacky-keyboard': {
        name: 'Bàn phím cơ gõ vui tai',
        description: 'Chiếc bàn phím nhiều màu sắc với hành trình phím lớn tạo cảm giác gõ rõ ràng, phù hợp cho những ai thích âm thanh và phản hồi cơ học khi nhập liệu.',
    },
    'ethernet-cable': {
        name: 'Cáp Ethernet',
        description: 'Cáp mạng Cat.6 dài 5m, tương thích ngược với chuẩn cũ, đầu RJ-45 có bảo vệ chống gập. Băng thông lên đến 250 MHz giúp truyền dữ liệu ổn định hơn so với Cat.5/Cat.5e.',
    },
    'usb-cable': {
        name: 'Cáp USB',
        description: 'Cáp sử dụng lõi dẫn chắc chắn để giảm nhiễu và độ trễ tín hiệu. Bề mặt dẫn điện độ tinh khiết cao cho hiệu năng tốt trong mức giá hợp lý.',
    },
    'instant-camera': {
        name: 'Máy ảnh lấy liền',
        description: 'Thiết kế hoài cổ cùng thao tác chụp đơn giản khiến máy ảnh lấy liền này trở thành lựa chọn dễ dùng để bắt đầu với ảnh in tức thì.',
    },
    'camera-lens': {
        name: 'Ống kính máy ảnh',
        description: 'Ống kính Di sử dụng hệ quang học được phủ đa lớp cải tiến, hoạt động tốt với cả máy ảnh SLR kỹ thuật số và máy ảnh phim.',
    },
    'vintage-folding-camera': {
        name: 'Máy ảnh gập cổ điển',
        description: 'Chiếc máy ảnh gập cổ điển này phù hợp làm vật trang trí cho nhà ở hoặc văn phòng hơn là chụp ảnh thực tế.',
    },
    tripod: {
        name: 'Chân máy ảnh',
        description: 'Chân máy nhẹ, có thể điều chỉnh độ cao, giúp giữ máy ổn định và chọn góc chụp chính xác cho ảnh chuyên nghiệp hơn.',
    },
    'instamatic-camera': {
        name: 'Máy ảnh Instamatic',
        description: 'Máy ảnh ngắm chụp giá dễ tiếp cận, dùng hộp phim 126 dễ lắp. Đèn flash tích hợp giúp chụp thuận tiện trong nhiều điều kiện ánh sáng.',
    },
    'compact-digital-camera': {
        name: 'Máy ảnh kỹ thuật số nhỏ gọn',
        description: 'Máy ảnh nhỏ gọn với hiệu năng cao, lấy nét mắt theo thời gian thực, tracking chính xác, chụp liên tiếp tốc độ cao và quay phim 4K HDR.',
    },
    'nikkormat-slr-camera': {
        name: 'Máy ảnh Nikkormat SLR',
        description: 'Nikkormat FS được Nikon ra mắt năm 1965, đi kèm ống kính Nikkor 50mm f1.4. Kính còn đẹp, lấy nét mượt và khẩu hoạt động tốt.',
    },
    'compact-slr-camera': {
        name: 'Máy ảnh SLR nhỏ gọn',
        description: 'Thiết kế hoài cổ, kích thước gọn và cảm biến APS-C 24MP mạnh mẽ giúp chiếc máy này phù hợp cho nhiếp ảnh sáng tạo hằng ngày.',
    },
    'twin-lens-camera': {
        name: 'Máy ảnh hai ống kính',
        description: 'Máy ảnh TLR có hai ống kính: một ống để chụp và một ống để ngắm qua hình ảnh phản chiếu trên màn lấy nét, tạo nên trải nghiệm cổ điển rất riêng.',
    },
    'road-bike': {
        name: 'Xe đạp đường trường',
        description: 'Khung carbon toàn phần, phuộc carbon chuyên cho cyclocross và bộ linh kiện chịu tải cao giúp xe nhẹ, hiệu quả và xử lý linh hoạt trên đường đua.',
    },
    'skipping-rope': {
        name: 'Dây nhảy',
        description: 'Dây nhảy chất lượng, ít rối khi tập luyện, phù hợp cho các bài cardio hằng ngày.',
    },
    'boxing-gloves': {
        name: 'Găng tay boxing',
        description: 'Găng tập được thiết kế để hỗ trợ kỹ thuật đấm đúng. Lớp foam hai tầng hấp thụ lực tốt và phần đệm đầy đủ ở trước, sau, cổ tay.',
    },
    tent: {
        name: 'Lều cắm trại',
        description: 'Lều rộng rãi cho tối đa 4 người, chiều cao thoải mái bên trong và kiểu dáng nổi bật, phù hợp cho chuyến đi ngoài trời.',
    },
    'cruiser-skateboard': {
        name: 'Ván trượt cruiser',
        description: 'Dựa trên dáng ván biểu tượng thập niên 1970 nhưng kích thước lớn hơn và linh kiện được nâng cấp, phù hợp cho người mới học và đi dạo cả ngày.',
    },
    football: {
        name: 'Bóng đá',
        description: 'Quả bóng có đồ họa tương phản cao để dễ quan sát khi chơi, vỏ TPU may máy cho hiệu năng ổn định.',
    },
    'tennis-ball': {
        name: 'Bóng tennis',
        description: 'Bóng tennis bền, dùng được lâu trong các buổi chơi hoặc luyện tập thường xuyên.',
    },
    basketball: {
        name: 'Bóng rổ',
        description: 'Bóng Wilson MVP phù hợp để chơi bóng rổ và luyện kỹ năng trong thời gian dài. Chất liệu cao su chất lượng cao dùng tốt trên mặt sân.',
    },
    'ultraboost-running-shoe': {
        name: 'Giày chạy Ultraboost',
        description: 'Giày chạy nhẹ, phản hồi tốt với lớp đệm đàn hồi và tấm carbon hỗ trợ lực đẩy về phía trước cho những bước chạy mạnh mẽ.',
    },
    'freerun-running-shoe': {
        name: 'Giày chạy Freerun',
        description: 'Giày chạy Freerun cho nam được thiết kế cho tốc độ, với phần upper Flyknit nhẹ và ôm chân.',
    },
    'hi-top-basketball-shoe': {
        name: 'Giày bóng rổ cổ cao',
        description: 'Giày bóng rổ cổ cao với đệm khí êm, hệ thống dây giữ chân chắc chắn để bạn tập trung vào trận đấu.',
    },
    'pureboost-running-shoe': {
        name: 'Giày chạy Pureboost',
        description: 'Giày chạy tự nhiên với vùng tiếp đất mở rộng, tấm gót tăng ổn định và upper dệt nhẹ, co giãn theo sải chân.',
    },
    'runx-running-shoe': {
        name: 'Giày chạy RunX',
        description: 'Giày chạy với upper lưới thoáng nhẹ, đế cao su bám đường và midsole êm cho từng bước chân.',
    },
    'allstar-sneakers': {
        name: 'Giày sneaker Allstar',
        description: 'All Star là một trong những mẫu sneaker biểu tượng nhất, nổi bật với dáng giày quen thuộc, miếng vá ngôi sao ở cổ chân và phong cách bền bỉ theo thời gian.',
    },
    'spiky-cactus': {
        name: 'Xương rồng gai',
        description: 'Cây xương rồng gai thanh lịch, phù hợp trang trí nhà ở hoặc văn phòng.',
    },
    'tulip-pot': {
        name: 'Chậu hoa tulip',
        description: 'Tulip đỏ rực với tâm hoa màu đen, nở đẹp dưới nắng. Phù hợp cho vườn đá, chậu cây và viền lối đi.',
    },
    'hanging-plant': {
        name: 'Cây treo',
        description: 'Cây ưa môi trường ấm và ẩm, thường được trồng treo để tạo điểm xanh mềm mại cho không gian.',
    },
    'aloe-vera': {
        name: 'Nha đam',
        description: 'Nha đam trang trí là cây trong nhà dễ chăm sóc. Phần gel nha đam cũng được biết đến với nhiều công dụng làm dịu da.',
    },
    'fern-blechnum-gibbum': {
        name: 'Dương xỉ Blechnum Gibbum',
        description: 'Cây dương xỉ xanh tươi giúp tạo cảm giác nhiệt đới trong nhà, có tán lá trang trí và thân nhỏ phát triển theo thời gian.',
    },
    'assorted-succulents': {
        name: 'Bộ sen đá trong nhà',
        description: 'Bộ sen đá gồm nhiều dáng và màu khác nhau. Cây phát triển tốt ở nơi nhiều sáng, lý tưởng là bệ cửa sổ có nắng.',
    },
    orchid: {
        name: 'Hoa lan',
        description: 'Hoa lan trắng thanh lịch, dễ phối với nhiều phong cách nội thất. Cành hoa lớn có thể giữ vẻ đẹp trong hơn 2 tháng.',
    },
    'bonsai-tree': {
        name: 'Cây bonsai',
        description: 'Bonsai bán thường xanh, có thể đặt trong nhà hoặc ngoài trời nhưng cần bảo vệ vào mùa lạnh.',
    },
    'guardian-lion-statue': {
        name: 'Tượng sư tử hộ mệnh',
        description: 'Đặt trong nhà hoặc văn phòng để tạo điểm nhấn trang trí và cảm giác trang trọng cho không gian.',
    },
    'hand-trowel': {
        name: 'Bay làm vườn',
        description: 'Bay cầm tay cho làm vườn, đầu phủ epoxy chống gỉ, chống trầy và chịu ẩm tốt hơn.',
    },
    'balloon-chair': {
        name: 'Ghế bóng bay',
        description: 'Một chiếc ghế gỗ trắng phong cách cổ điển đi kèm quả bóng bay hồng tròn nổi bật. Bóng có thể tháo rời và dùng cho mục đích khác, ví dụ như trang trí tiệc.',
    },
    'grey-fabric-sofa': {
        name: 'Sofa vải xám',
        description: 'Đệm ngồi bằng foam đàn hồi cao và bông polyester tạo cảm giác nâng đỡ thoải mái. Vỏ bọc có thể tháo rời và giặt máy.',
    },
    'leather-sofa': {
        name: 'Sofa da',
        description: 'Ghế sofa da nâu cao cấp có cần gạt ngả lưng dễ điều chỉnh. Thiết kế lưng đệm và tay bo tròn tập trung vào sự thoải mái.',
    },
    'light-shade': {
        name: 'Chụp đèn',
        description: 'Chụp đèn treo polycotton trắng hiện đại, mặt trong màu bạc chrome giúp phản chiếu ánh sáng tốt hơn.',
    },
    'wooden-side-desk': {
        name: 'Bàn phụ gỗ',
        description: 'Ngăn kéo có chặn chống kéo quá tay. Hệ thống quản lý dây cáp tích hợp giúp không gian gọn gàng hơn.',
    },
    'comfy-padded-chair': {
        name: 'Ghế đệm êm',
        description: 'Lưng ghế được tạo hình giúp ngồi thoải mái. Khung ghế làm từ gỗ nguyên khối bền chắc.',
    },
};

const viFacetNames: Record<string, string> = {
    category: 'Danh mục',
    brand: 'Thương hiệu',
    color: 'Màu sắc',
    'plant type': 'Loại cây',
};

const viFacetValues: Record<string, string> = {
    Electronics: 'Điện tử',
    Computers: 'Máy tính',
    Photo: 'Nhiếp ảnh',
    'Sports & Outdoor': 'Thể thao & Ngoài trời',
    Equipment: 'Thiết bị',
    Footwear: 'Giày dép',
    'Home & Garden': 'Nhà cửa & Sân vườn',
    Plants: 'Cây cảnh',
    Furniture: 'Nội thất',
    Indoor: 'Trong nhà',
    Outdoor: 'Ngoài trời',
    blue: 'Xanh dương',
    pink: 'Hồng',
    black: 'Đen',
    white: 'Trắng',
    gray: 'Xám',
    brown: 'Nâu',
    wood: 'Màu gỗ',
    yellow: 'Vàng',
    green: 'Xanh lá',
};

export function getLocalizedCollectionName(slug: string | undefined, fallback: string, locale: string): string {
    if (locale !== 'vi' || !slug) {
        return fallback;
    }

    return viCollections[slug]?.name ?? fallback;
}

export function getLocalizedProductName(slug: string | undefined, fallback: string, locale: string): string {
    if (locale !== 'vi' || !slug) {
        return fallback;
    }

    return viProducts[slug]?.name ?? fallback;
}

export function getLocalizedProductDescription(slug: string | undefined, fallback: string, locale: string): string {
    if (locale !== 'vi' || !slug) {
        return fallback;
    }

    return viProducts[slug]?.description ?? fallback;
}

export function getLocalizedFacetName(fallback: string, locale: string): string {
    if (locale !== 'vi') {
        return fallback;
    }

    return viFacetNames[fallback] ?? fallback;
}

export function getLocalizedFacetValue(fallback: string, locale: string): string {
    if (locale !== 'vi') {
        return fallback;
    }

    return viFacetValues[fallback] ?? fallback;
}

export function localizeCollection<T extends CollectionLike>(collection: T, locale: string): T {
    if (locale !== 'vi' || !collection.slug) {
        return collection;
    }

    return {
        ...collection,
        name: getLocalizedCollectionName(collection.slug, collection.name ?? collection.slug, locale),
    };
}

export function localizeProduct<T extends ProductLike>(product: T, locale: string): T {
    if (locale !== 'vi' || !product.slug) {
        return product;
    }

    const override = viProducts[product.slug];
    if (!override) {
        return {
            ...product,
            collections: product.collections?.map((collection) => localizeCollection(collection, locale)),
        };
    }

    return {
        ...product,
        name: product.name ? override.name : product.name,
        productName: product.productName ? override.name : product.productName,
        description: product.description ? (override.description ?? product.description) : product.description,
        collections: product.collections?.map((collection) => localizeCollection(collection, locale)),
    };
}
