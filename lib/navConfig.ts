// lib/navConfig.ts
export interface NavItem {
    href: string;
    label: string;
    enabled: boolean;
    isNew?: boolean;
  }
  
  export const navItems: NavItem[] = [
    { href: '/store', label: '市集', enabled: true },
    { href: '/education', label: '教育', enabled: true },
    { href: '/dbchat', label: ' 对话数据', enabled: true},
    { href: '/bvideos', label: 'B 站视频', enabled: true },
    { href: '/efficiency', label: '效率工具', enabled: true},
    
  ];