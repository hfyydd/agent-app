// components/NavBar.js
import Image from 'next/image';
import AuthButton from "./AuthButton";
import NavLink from './NavLink';
import { navItems } from '../lib/navConfig';
import MobileMenu from './MobileMenu';
import TotalViews from './TotalViews';
import ThemeToggle from './ThemeToggle'; // Added ThemeToggle component

// 假设你的版本号存储在某个配置文件中
// config.js 或 config.ts
export const VERSION = '0.1.0';  // 根据你的实际版本号进行更新

export default function NavBar() {
  return (
    <nav className="w-full border-b border-b-foreground/10 bg-background">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center">
          <NavLink href="/store" enabled={true} label={
            <div className="flex items-center space-x-2">
              <Image src="/images/koala.svg" alt="Logo" width={32} height={32} />
              <span className="font-bold text-lg sm:text-xl">考拉的交易市集</span>
              <span className="text-xs text-gray-500">v{VERSION}</span>
              <TotalViews />
            </div>
          } />
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <div className="flex items-center space-x-2">
            <ThemeToggle /> {/* Added ThemeToggle component */}
            <AuthButton />
          </div>
        </div>
        <MobileMenu navItems={navItems}>
          <div className="flex items-center justify-between">
            {/* <TotalViews /> */}
            <ThemeToggle /> {/* Added ThemeToggle component */}
            <AuthButton />
          </div>
        </MobileMenu>
      </div>
    </nav>
  );
}