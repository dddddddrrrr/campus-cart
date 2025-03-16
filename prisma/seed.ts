import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清除现有数据
  await prisma.category.deleteMany({});

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

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
  }

  console.log('分类数据创建成功！');
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
