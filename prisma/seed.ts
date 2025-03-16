import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清除现有数据
  await prisma.category.deleteMany({});
  await prisma.product.deleteMany({});

  // 创建分类数据
  const categories = [
    {
      name: "电子书",
      icon: "BookOpen",
    },
    {
      name: "电子产品",
      icon: "Laptop",
    },
    {
      name: "衣物",
      icon: "Shirt",
    },
    {
      name: "运动用品",
      icon: "Dumbbell",
    },
    {
      name: "家具",
      icon: "Home",
    },
    {
      name: "课程材料",
      icon: "GraduationCap",
    },
    {
      name: "音乐与乐器",
      icon: "Music",
    },
    {
      name: "配件",
      icon: "ShoppingBag",
    },
  ];

  console.log(`开始创建 ${categories.length} 个分类...`);

  // 创建分类并保存ID映射
  const categoryMap = new Map();
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category,
    });
    categoryMap.set(category.name, createdCategory.id);
  }

  console.log('分类数据创建成功！');

  // 映射英文分类名称到中文分类名称
  const categoryNameMap = {
    "Electronics": "电子产品",
    "Books": "电子书",
    "Home & Living": "家具",
    "Sports": "运动用品",
    "Furniture": "家具",
    "Fashion": "衣物",
    "Accessories": "配件",
  };

  // 特色商品数据
  const featuredProducts = [
    {
      name: "MacBook Pro 15-inch (2019)",
      price: 1299,
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop",
      category: "Electronics",
      isNew: true,
      isFeatured: true,
      discount: 10,
      sellerName: "Apple Store",
      rating: 5,
    },
    {
      name: "Wireless Noise Cancelling Headphones",
      price: 199,
      imageUrl: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=2087&auto=format&fit=crop",
      category: "Electronics",
      isNew: false,
      isFeatured: true,
      discount: 0,
      sellerName: "AudioTech",
      rating: 4,
    },
    {
      name: "Calculus Early Transcendentals Textbook",
      price: 89,
      imageUrl: "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=2070&auto=format&fit=crop",
      category: "Books",
      isNew: false,
      isFeatured: true,
      discount: 15,
      sellerName: "BookStore",
      rating: 4,
    },
    {
      name: "Modern Desk Lamp",
      price: 49.99,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop",
      category: "Home & Living",
      isNew: true,
      isFeatured: true,
      discount: 0,
      sellerName: "HomeDecor",
      rating: 5,
    },
    {
      name: "Basketball - Official Size",
      price: 29.99,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1470&auto=format&fit=crop",
      category: "Sports",
      isNew: false,
      isFeatured: true,
      discount: 0,
      sellerName: "SportGoods",
      rating: 4,
    },
    {
      name: "Ergonomic Office Chair",
      price: 199.99,
      imageUrl: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=2070&auto=format&fit=crop",
      category: "Furniture",
      isNew: false,
      isFeatured: true,
      discount: 20,
      sellerName: "FurnitureWorld",
      rating: 4,
    },
    {
      name: "Designer Backpack",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
      category: "Fashion",
      isNew: true,
      isFeatured: true,
      discount: 0,
      sellerName: "FashionTrends",
      rating: 5,
    },
    {
      name: "Water Bottle - 32oz",
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=2070&auto=format&fit=crop",
      category: "Accessories",
      isNew: false,
      isFeatured: true,
      discount: 0,
      sellerName: "EcoGoods",
      rating: 4,
    },
  ];

  console.log(`开始创建 ${featuredProducts.length} 个特色商品...`);

  // 创建商品数据
  for (const product of featuredProducts) {
    const chineseCategoryName = categoryNameMap[product.category];
    const categoryId = categoryMap.get(chineseCategoryName);
    
    if (!categoryId) {
      console.error(`未找到分类: ${product.category} -> ${chineseCategoryName}`);
      continue;
    }

    // 计算原价 (如果有折扣，则原价 = 当前价格 / (1 - 折扣百分比))
    const originalPrice = product.discount > 0 
      ? product.price / (1 - product.discount / 100) 
      : product.price;

    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        originalPrice: parseFloat(originalPrice.toFixed(2)),
        stock: 100, // 默认库存
        description: `${product.name} - 由 ${product.sellerName} 提供`,
        imageUrl: product.imageUrl,
        categoryId: categoryId,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        rating: product.rating,
        discount: product.discount,
      },
    });
  }

  console.log('特色商品数据创建成功！');
}

void main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
