import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始填充种子数据...')

  const categories = await prisma.category.createMany({
    data: [
      { name: '股票' },
      { name: '基金' },
      { name: '债券' },
      { name: '期货' },
      { name: '外汇' },
      { name: '财经要闻' },
      { name: '宏观经济' },
      { name: '公司动态' },
      { name: '投资理财' },
      { name: '科技金融' }
    ],
    skipDuplicates: true
  })
  console.log(`创建了 ${categories.count} 个分类`)

  const tags = await prisma.tag.createMany({
    data: [
      { name: 'A股' },
      { name: '港股' },
      { name: '美股' },
      { name: '基金定投' },
      { name: 'ETF' },
      { name: '债券基金' },
      { name: '期货交易' },
      { name: '外汇分析' },
      { name: '央行政策' },
      { name: 'IPO' },
      { name: '财报分析' },
      { name: '行业研究' },
      { name: '风险管理' },
      { name: '价值投资' },
      { name: '技术分析' }
    ],
    skipDuplicates: true
  })
  console.log(`创建了 ${tags.count} 个标签`)

  const hashedPassword = await bcrypt.hash('Test123456', 10)

  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        uid: 'user-test001',
        displayId: 'U000001',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        avatar: null
      }
    })
    console.log('创建测试用户: testuser')
  } else {
    console.log('测试用户已存在')
  }

  const stockCategory = await prisma.category.findFirst({
    where: { name: '股票' }
  })

  if (stockCategory) {
    const existingNews = await prisma.news.findFirst()
    
    if (!existingNews) {
      await prisma.news.createMany({
        data: [
          {
            title: 'A股三大指数集体收涨 成交额突破万亿',
            summary: '今日A股三大指数集体收涨，沪指涨1.2%，深成指涨1.5%，创业板指涨1.8%。两市成交额突破1.2万亿元，北向资金净流入超百亿。',
            content: '今日A股市场表现强劲，三大指数集体收涨。截至收盘，沪指报3150.32点，涨1.2%；深成指报10250.45点，涨1.5%；创业板指报2050.78点，涨1.8%。\n\n两市成交额突破1.2万亿元，较上一交易日放量明显。北向资金全天净流入超100亿元，显示外资对A股市场信心增强。\n\n行业板块方面，科技股领涨，半导体、芯片、人工智能等板块涨幅居前。金融股表现稳健，银行、保险板块小幅上涨。',
            publishTime: new Date(),
            source: '财经快讯',
            views: 1256,
            hasImage: true,
            imageUrl: '/uploads/news/sample1.jpg',
            categoryId: stockCategory.id
          },
          {
            title: '央行宣布降准0.25个百分点 释放长期资金约5000亿',
            summary: '中国人民银行决定于2024年X月X日下调金融机构存款准备金率0.25个百分点，预计释放长期资金约5000亿元。',
            content: '中国人民银行今日宣布，决定于2024年X月X日下调金融机构存款准备金率0.25个百分点，此次降准预计将释放长期资金约5000亿元。\n\n央行表示，此次降准旨在保持流动性合理充裕，降低银行业金融机构资金成本，从而引导金融机构加大对实体经济的支持力度。\n\n分析人士认为，此次降准将对股市、债市形成利好，有助于稳定市场预期，促进经济平稳健康发展。',
            publishTime: new Date(Date.now() - 3600000),
            source: '央行官网',
            views: 3542,
            hasImage: false,
            categoryId: stockCategory.id
          },
          {
            title: '新能源汽车销量创新高 行业景气度持续提升',
            summary: '2024年第一季度新能源汽车销量突破200万辆，同比增长35%，行业景气度持续提升。',
            content: '据中国汽车工业协会统计，2024年第一季度新能源汽车销量突破200万辆，同比增长35%，市场渗透率进一步提升至35%。\n\n从品牌表现来看，比亚迪继续领跑市场，特斯拉、蔚来、理想等品牌销量也实现较快增长。出口方面，新能源汽车出口量同比增长50%，成为汽车出口的重要增长点。\n\n业内人士表示，随着充电基础设施不断完善、电池成本持续下降，新能源汽车市场有望保持高速增长态势。',
            publishTime: new Date(Date.now() - 7200000),
            source: '汽车协会',
            views: 2891,
            hasImage: true,
            imageUrl: '/uploads/news/sample2.jpg',
            categoryId: stockCategory.id
          }
        ]
      })
      console.log('创建了示例新闻数据')
    } else {
      console.log('新闻数据已存在')
    }
  }

  console.log('种子数据填充完成!')
}

main()
  .catch((e) => {
    console.error('种子数据填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
