// ======================================================
// DATA & FETCHING
// ======================================================

const fallbackData = [
    { id: 1, name: "Mixer Shirt", price: 220.00, image: "https://cdn.hstatic.net/products/200000881795/img_6244_f9e3f4027f66420e9324d02da7426604_1024x1024.jpg", category: "men", is_new: true, is_sale: false, description: "Áo sơ mi cotton cao cấp." },
    { id: 2, name: "Premium Mixer Shirt", price: 150.00, image: "https://cdn.hstatic.net/products/200000881795/img_6148_7e000342d1064663817239df097e963c_1024x1024.jpg", category: "men", is_new: false, is_sale: true, description: "Phiên bản cao cấp." },
    { id: 3, name: "Mixer Sweater", price: 180.00, image: "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgkvzklfqw3t31.webp", category: "women", is_new: true, is_sale: false, description: "Áo len ấm áp." },
    { id: 4, name: "Mixer Bomber", price: 195.00, image: "https://scontent.cdninstagram.com/v/t39.30808-6/482082559_628880779898845_7095192503266816727_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&_nc_sid=58cdad", category: "men", is_new: false, is_sale: false, description: "Bomber jacket." },
    { id: 5, name: "Elegant Dress", price: 120.00, image: "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mf0javjh2fimf2.webp", category: "women", is_new: false, is_sale: true, description: "Đầm lụa sang trọng." },
    { id: 6, name: "Winter Coat", price: 300.00, image: "https://scontent.cdninstagram.com/v/t39.30808-6/482000804_628880776565512_8226875193744178816_n.jpg?stp=c0.1.962.1202a_cp6_dst-jpg_e35_tt6&_nc_cat=109", category: "women", is_new: true, is_sale: false, description: "Áo khoác dạ." },
    { id: 7, name: "Classic Denim Jacket", price: 125.00, image: "https://img.freepik.com/free-photo/handsome-man-denim-jacket-autumn-fashion-shoot_53876-102248.jpg", category: "men", is_new: false, is_sale: false, description: "Áo khoác Jean cổ điển, bền bỉ." },
    { id: 8, name: "Summer Floral Dress", price: 85.00, image: "https://img.freepik.com/free-photo/young-woman-beautiful-dress-hat-posing-nature_1157-4869.jpg", category: "women", is_new: true, is_sale: false, description: "Đầm hoa mùa hè thoáng mát." },
    { id: 9, name: "Urban Street Hoodie", price: 95.00, image: "https://img.freepik.com/free-photo/man-wearing-brown-hoodie-studio-shot_53876-102066.jpg", category: "men", is_new: true, is_sale: false, description: "Hoodie phong cách đường phố." },
    { id: 10, name: "Slim Fit Chinos", price: 60.00, image: "https://img.freepik.com/free-photo/fashion-men-s-legs-jeans-sneakers_1157-46682.jpg", category: "men", is_new: false, is_sale: true, description: "Quần Chinos dáng ôm lịch lãm." },
    { id: 11, name: "Elegant Blouse", price: 70.00, image: "https://img.freepik.com/free-photo/portrait-young-happy-woman-white-blouse_171337-2639.jpg", category: "women", is_new: false, is_sale: false, description: "Áo kiểu nữ tính, thanh lịch." },
    { id: 12, name: "Leather Biker Jacket", price: 250.00, image: "https://img.freepik.com/free-photo/portrait-handsome-man-black-leather-jacket_158538-18868.jpg", category: "men", is_new: false, is_sale: false, description: "Áo khoác da phong cách Biker." },
    { id: 13, name: "Pleated Midi Skirt", price: 55.00, image: "https://img.freepik.com/free-photo/woman-green-pleated-skirt-street-style-apparel-shoot_53876-101283.jpg", category: "women", is_new: true, is_sale: false, description: "Chân váy xếp ly dáng dài." },
    { id: 14, name: "Casual Polo Shirt", price: 45.00, image: "https://img.freepik.com/free-photo/portrait-handsome-smiling-stylish-young-man-model-wearing-jeans-clothes-sunglasses-fashion-man_158538-5023.jpg", category: "men", is_new: false, is_sale: true, description: "Áo Polo đơn giản, năng động." },
    { id: 15, name: "Cozy Knit Cardigan", price: 80.00, image: "https://img.freepik.com/free-photo/young-woman-wearing-knitted-cardigan_273609-26563.jpg", category: "women", is_new: false, is_sale: true, description: "Áo khoác len mỏng nhẹ nhàng." },
    { id: 16, name: "Running Shorts", price: 35.00, image: "https://img.freepik.com/free-photo/sporty-man-tying-shoelace-running-shoes_1150-6388.jpg", category: "men", is_new: true, is_sale: false, description: "Quần short thể thao thoáng khí." },
    { id: 17, name: "Office Pencil Skirt", price: 50.00, image: "https://img.freepik.com/free-photo/business-woman-posing-studio_23-2148049984.jpg", category: "women", is_new: false, is_sale: false, description: "Chân váy bút chì công sở." },
    { id: 18, name: "Graphic Tee", price: 30.00, image: "https://img.freepik.com/free-photo/young-man-wearing-white-t-shirt_273609-18836.jpg", category: "men", is_new: true, is_sale: false, description: "Áo thun in hình độc đáo." },
    { id: 19, name: "Boho Maxi Dress", price: 110.00, image: "https://img.freepik.com/free-photo/beautiful-woman-summer-dress-hat-walking-beach_1303-18654.jpg", category: "women", is_new: false, is_sale: true, description: "Đầm Maxi phong cách Boho." },
    { id: 20, name: "Cargo Pants", price: 75.00, image: "https://img.freepik.com/free-photo/fashion-man-sitting-chair_144627-39428.jpg", category: "men", is_new: false, is_sale: false, description: "Quần túi hộp cá tính." },
    { id: 21, name: "Crop Top Hoodie", price: 55.00, image: "https://img.freepik.com/free-photo/young-woman-sportswear-posing_23-2148439589.jpg", category: "women", is_new: true, is_sale: false, description: "Áo Hoodie dáng ngắn trẻ trung." },
    { id: 22, name: "Formal Suit Jacket", price: 180.00, image: "https://img.freepik.com/free-photo/handsome-man-black-suit-white-shirt-posing-studio_158538-19209.jpg", category: "men", is_new: false, is_sale: false, description: "Áo Vest lịch sự cho sự kiện." },
    { id: 23, name: "High Waist Jeans", price: 65.00, image: "https://img.freepik.com/free-photo/young-woman-wearing-jeans_273609-20856.jpg", category: "women", is_new: false, is_sale: true, description: "Quần Jean cạp cao tôn dáng." },
    { id: 24, name: "Oversized Sweater", price: 90.00, image: "https://img.freepik.com/free-photo/young-woman-sweater_23-2147681678.jpg", category: "women", is_new: true, is_sale: false, description: "Áo len form rộng ấm áp." },
    { id: 25, name: "Track Jacket", price: 85.00, image: "https://img.freepik.com/free-photo/man-sportswear-posing-dark_158538-14563.jpg", category: "men", is_new: false, is_sale: true, description: "Áo khoác thể thao năng động." },
    { id: 26, name: "Silk Scarf", price: 40.00, image: "https://img.freepik.com/free-photo/elegant-woman-with-silk-scarf_23-2148136543.jpg", category: "women", is_new: false, is_sale: false, description: "Khăn lụa mềm mại, sang trọng." }
];

async function fetchProducts() {
    try {
        if(supabase) {
            let { data, error } = await supabase.from('products').select('*');
            if (!error && data && data.length > 0) {
                console.log("Loaded from Supabase:", data.length);
                return data;
            } else {
                console.warn("Supabase empty, using fallback.");
                return fallbackData;
            }
        } else {
            console.warn("Supabase not configured, using fallback.");
            return fallbackData;
        }
    } catch (e) {
        console.error("Fetch Error:", e);
        return fallbackData;
    }
}

// Hàm Seed Data vào Supabase
window.seedSupabase = async function() {
    if(!supabase) { showToast("Supabase not configured!", "error"); return; }
    
    const confirm = window.confirm("Are you sure you want to upload all fallback data to Supabase? This might duplicate items if they already exist.");
    if(!confirm) return;

    showToast("Starting upload...", "info");
    
    let successCount = 0;
    let errorCount = 0;

    for (const p of fallbackData) {
        const { data, error } = await supabase.from('products').upsert(p, { onConflict: 'id' });
        
        if(error) {
            console.error("Error uploading:", p.name, error);
            errorCount++;
        } else {
            console.log("Uploaded:", p.name);
            successCount++;
        }
    }

    if(errorCount === 0) {
        showToast(`Successfully uploaded ${successCount} products!`, "success");
    } else {
        showToast(`Uploaded ${successCount}, Failed ${errorCount}. Check console.`, "warning");
    }
};
