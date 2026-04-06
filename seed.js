// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// // Import Schemas
// const roleModel = require('./schemas/roles');
// const userModel = require('./schemas/users');
// const categoryModel = require('./schemas/categories');
// const foodModel = require('./schemas/foods');
// const voucherModel = require('./schemas/vouchers');
// const cartModel = require('./schemas/cart');

// const MONGO_URI = 'mongodb://localhost:27017/food-order'; // Thay đổi theo DB của bạn

// async function seed() {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log('Connected to MongoDB for seeding...');

//     // Clear existing data (Optional - Be careful!)
//     // await roleModel.deleteMany({});
//     // await userModel.deleteMany({});
//     // await categoryModel.deleteMany({});
//     // await foodModel.deleteMany({});
//     // await voucherModel.deleteMany({});

//     // 1. Roles
//     const roles = [
//       { name: 'ADMIN', description: 'Administrator with full access' },
//       { name: 'MODERATOR', description: 'Moderator for orders and foods' },
//       { name: 'CUSTOMER', description: 'Customer for shopping' }
//     ];

//     const savedRoles = [];
//     for (const r of roles) {
//       let role = await roleModel.findOne({ name: r.name });
//       if (!role) {
//         role = new roleModel(r);
//         await role.save();
//         console.log(`Role ${r.name} created.`);
//       }
//       savedRoles.push(role);
//     }

//     const adminRole = savedRoles.find(r => r.name === 'ADMIN');
//     const modRole = savedRoles.find(r => r.name === 'MODERATOR');
//     const custRole = savedRoles.find(r => r.name === 'CUSTOMER');

//     // 2. Users
//     const users = [
//       {
//         username: 'admin',
//         email: 'admin@food.com',
//         password: 'adminpassword',
//         role: adminRole._id,
//         fullName: 'System Admin',
//         phone: '0123456789',
//         status: true
//       },
//       {
//         username: 'moderator',
//         email: 'mod@food.com',
//         password: 'modpassword',
//         role: modRole._id,
//         fullName: 'Toi la Moderator',
//         phone: '0987654321',
//         status: true
//       },
//       {
//         username: 'customer1',
//         email: 'cust1@food.com',
//         password: 'custpassword',
//         role: custRole._id,
//         fullName: 'Dang Cao Bo',
//         phone: '0333444555',
//         status: true
//       }
//     ];

//     for (const u of users) {
//       let user = await userModel.findOne({ username: u.username });
//       if (!user) {
//         user = new userModel(u);
//         await user.save();
//         // Create cart for user
//         const cart = new cartModel({ user: user._id });
//         await cart.save();
//         console.log(`User ${u.username} created.`);
//       }
//     }

//     // 3. Categories
//     const categories = [
//       { name: 'Pizza', description: 'Bánh Pizza kiểu Ý' },
//       { name: 'Burger', description: 'Bánh mì kẹp thịt' },
//       { name: 'Drinks', description: 'Đồ uống các loại' },
//       { name: 'Pasta', description: 'Mỳ Ý đặc biệt' }
//     ];

//     const savedCats = [];
//     for (const c of categories) {
//       let cat = await categoryModel.findOne({ name: c.name });
//       if (!cat) {
//         cat = new categoryModel(c);
//         await cat.save();
//         console.log(`Category ${c.name} created.`);
//       }
//       savedCats.push(cat);
//     }

//     // 4. Foods
//     const pizzaCat = savedCats.find(c => c.name === 'Pizza');
//     const burgerCat = savedCats.find(c => c.name === 'Burger');
//     const drinkCat = savedCats.find(c => c.name === 'Drinks');

//     const foods = [
//       { name: 'Pizza Seafood', price: 189000, category: pizzaCat._id, description: 'Pizza hải sản sốt phô mai' },
//       { name: 'Pizza Cheese', price: 149000, category: pizzaCat._id, description: 'Pizza ngập tràn phô mai' },
//       { name: 'Beef Burger', price: 85000, category: burgerCat._id, description: 'Burger thịt bò nướng' },
//       { name: 'Chicken Burger', price: 75000, category: burgerCat._id, description: 'Burger gà chiên giòn' },
//       { name: 'Coca Cola', price: 15000, category: drinkCat._id, description: 'Nước giải khát' },
//       { name: 'Ice Coffee', price: 25000, category: drinkCat._id, description: 'Cà phê đá' }
//     ];

//     for (const f of foods) {
//       let food = await foodModel.findOne({ name: f.name });
//       if (!food) {
//         food = new foodModel({
//           ...f,
//           slug: f.name.toLowerCase().replace(/ /g, '-'),
//           isAvailable: true
//         });
//         await food.save();
//         console.log(`Food ${f.name} created.`);
//       }
//     }

//     // 5. Vouchers
//     const vouchers = [
//       {
//         code: 'WELCOME50',
//         description: 'Giảm 50k cho đơn đầu tiên',
//         discountType: 'fixed',
//         discountValue: 50000,
//         minOrderAmount: 100000,
//         startDate: new Date(),
//         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//         isActive: true
//       },
//       {
//         code: 'PIZZA20',
//         description: 'Giảm 20% cho fan Pizza',
//         discountType: 'percent',
//         discountValue: 20,
//         minOrderAmount: 200000,
//         maxDiscount: 100000,
//         startDate: new Date(),
//         endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//         isActive: true
//       }
//     ];

//     for (const v of vouchers) {
//       let voucher = await voucherModel.findOne({ code: v.code });
//       if (!voucher) {
//         voucher = new voucherModel(v);
//         await voucher.save();
//         console.log(`Voucher ${v.code} created.`);
//       }
//     }

//     console.log('Seeding completed successfully!');
//     process.exit(0);
//   } catch (err) {
//     console.error('Error seeding data:', err);
//     process.exit(1);
//   }
// }

// seed();
