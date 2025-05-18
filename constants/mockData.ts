import { Product } from '../contexts/CartContext';

// Danh mục sản phẩm sữa
export const categories = [
  { id: 'fresh', name: 'Sữa tươi' },
  { id: 'powder', name: 'Sữa bột' },
  { id: 'condensed', name: 'Sữa đặc' },
  { id: 'plant', name: 'Sữa thực vật' },
  { id: 'yogurt', name: 'Sữa chua' },
];

// Dữ liệu sản phẩm mẫu
export const products: Product[] = [
  {
    id: '1',
    name: 'Sữa tươi tiệt trùng Vinamilk 100% (Hộp 1L)',
    price: 29000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/76452/bhx/sua-tuoi-tiet-trung-vinamilk-100-sua-co-duong-hop-1-lit-202104100025154372.jpg',
    description: 'Sữa tươi 100% từ sữa bò tươi nguyên chất, giàu canxi và vitamin D3, không sử dụng hoóc môn tăng trưởng, tốt cho sức khỏe xương khớp.',
    category: 'fresh',
  },
  {
    id: '2',
    name: 'Sữa tươi TH True Milk (Lốc 4 hộp x 180ml)',
    price: 32000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/193438/bhx/loc-4-hop-sua-tuoi-tiet-trung-co-duong-th-true-milk-180ml-202104100028590743.jpg',
    description: 'Sữa tươi TH True Milk được sản xuất từ nguồn sữa tươi 100% từ trang trại bò sữa công nghệ cao, đạt tiêu chuẩn GlobalGAP.',
    category: 'fresh',
  },
  {
    id: '3',
    name: 'Sữa bột Enfamil A+ 1 (850g)',
    price: 489000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/223379/bhx/sua-bot-enfamil-a-1-870g-202101072215097888.jpg',
    description: 'Sữa bột Enfamil A+ 1 chứa DHA, Choline và nhiều dưỡng chất quan trọng giúp phát triển não bộ và thị lực cho trẻ từ 0-6 tháng tuổi.',
    category: 'powder',
  },
  {
    id: '4',
    name: 'Sữa bột Friso Gold 4 (1.5kg)',
    price: 649000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/195030/bhx/sua-friso-gold-4-15kg-cho-tre-tu-2-6-tuoi-202104101627118043.jpg',
    description: 'Sữa bột Friso Gold 4 dành cho trẻ từ 2-6 tuổi, với công thức Lock Nutri giúp trẻ hấp thu dinh dưỡng tối ưu và tăng cường sức đề kháng.',
    category: 'powder',
  },
  {
    id: '5',
    name: 'Sữa đặc có đường Ông Thọ (Lon 380g)',
    price: 25000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/84091/bhx/sua-dac-co-duong-ong-tho-trang-380g-202104230904401505.jpg',
    description: 'Sữa đặc có đường Ông Thọ với hương vị thơm ngon, béo ngậy, thích hợp dùng với bánh mì, pha cà phê, làm bánh và chế biến món tráng miệng.',
    category: 'condensed',
  },
  {
    id: '6',
    name: 'Sữa đặc có đường Ngôi sao Phương Nam (Lon 380g)',
    price: 22000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/134245/bhx/sua-dac-co-duong-ngoi-sao-phuong-nam-xanh-duong-nhat-nhan-380g-202104230937080903.jpg',
    description: 'Sữa đặc có đường Ngôi sao Phương Nam thơm ngon, sánh mịn, dùng pha cà phê, làm bánh hoặc pha với các thức uống khác.',
    category: 'condensed',
  },
  {
    id: '7',
    name: 'Sữa hạt óc chó Việt Quất (1L)',
    price: 35000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/223918/bhx/sua-hat-oc-cho-viet-quat-mchild-1-lit-202104101057243343.jpg',
    description: 'Sữa hạt óc chó Việt Quất thơm ngon, bổ dưỡng, giàu protein, omega-3, calcium và nhiều dưỡng chất thiết yếu cho cơ thể.',
    category: 'plant',
  },
  {
    id: '8',
    name: 'Sữa hạnh nhân Mộc Châu (180ml)',
    price: 15000,
    image: 'https://cdn.tgdd.vn/Products/Images/2386/239176/bhx/sua-hanh-nhan-nguyen-cao-moc-chau-milk-180ml-202104101054450333.jpg',
    description: 'Sữa hạnh nhân Mộc Châu với hương vị thơm ngon, không chứa cholesterol, ít chất béo, thích hợp cho người ăn chay và người dị ứng sữa bò.',
    category: 'plant',
  },
  {
    id: '9',
    name: 'Sữa chua Vinamilk (Lốc 4 hộp x 100g)',
    price: 28000,
    image: 'https://cdn.tgdd.vn/Products/Images/2739/219150/bhx/loc-4-hop-sua-chua-an-vinamilk-co-duong-100g-202104091439361050.jpg',
    description: 'Sữa chua Vinamilk chứa hàng tỷ lợi khuẩn probiotics, giúp hệ tiêu hóa khỏe mạnh, tăng cường sức đề kháng và bổ sung canxi cho cơ thể.',
    category: 'yogurt',
  },
  {
    id: '10',
    name: 'Sữa chua uống Yakult (Lốc 5 chai x 65ml)',
    price: 25000,
    image: 'https://cdn.tgdd.vn/Products/Images/2739/87520/bhx/loc-5-chai-sua-chua-uong-tiet-trung-yakult-65ml-202104091631289329.jpg',
    description: 'Sữa chua uống Yakult chứa vi khuẩn L. Casei Shirota giúp cân bằng hệ vi sinh đường ruột, tăng cường sức đề kháng và hỗ trợ tiêu hóa.',
    category: 'yogurt',
  },
];

// Phân loại sản phẩm theo danh mục
export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(product => product.category === categoryId);
};

// Tìm kiếm sản phẩm
export const searchProducts = (keyword: string): Product[] => {
  const searchTerm = keyword.toLowerCase();
  return products.filter(
    product => 
      product.name.toLowerCase().includes(searchTerm) || 
      product.description.toLowerCase().includes(searchTerm)
  );
}; 