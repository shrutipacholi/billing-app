import * as lucide from 'lucide-react';

const iconsToCheck = [
  'LayoutDashboard',
  'Receipt',
  'LogOut',
  'Menu',
  'X',
  'ChevronLeft',
  'ChevronRight',
  'Users',
  'CreditCard',
  'DollarSign',
  'Activity',
  'Plus',
  'Trash2',
  'Printer',
  'FileText',
  'ShoppingCart',
  'Percent',
  'Eye',
  'FileSpreadsheet',
  'Save'
];

console.log('Checking lucide-react exports:');
iconsToCheck.forEach(iconName => {
  const icon = lucide[iconName];
  if (!icon) {
    console.error(`❌ Icon "${iconName}" is NOT exported by lucide-react!`);
  } else {
    console.log(`✅ Icon "${iconName}" is exported.`);
  }
});
