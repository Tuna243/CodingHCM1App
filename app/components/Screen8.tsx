/**
 * © Bản quyền thuộc về khu vực HCM1 & 4 bởi Trần Chí Bảo
 */

'use client';

import { cn } from '@/lib/utils';
import { BookOpen, ExternalLink, FileText, GraduationCap, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface HomeworkCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  hoverColor: string;
  courses: {
    id: string;
    name: string;
    link: string;
  }[];
}

const homeworkCategories: HomeworkCategory[] = [
  {
    id: 'rob4',
    name: 'ROB4+',
    icon: Rocket,
    color: 'from-purple-500 to-indigo-600',
    hoverColor: 'hover:from-purple-600 hover:to-indigo-700',
    courses: [
      {
        id: 'rob4b',
        name: 'ROB4B - KIROB',
        link: 'https://drive.google.com/drive/folders/1G5EbA34pr2BZOZt3G1jMwp2putKOR_7_?usp=drive_link'
      },
      {
        id: 'rob4a',
        name: 'ROB4A - KIROA',
        link: 'https://drive.google.com/drive/folders/1E-B3r0ZGnw_XV9QcuQDd04aGJxg9Kw4N?usp=drive_link'
      }
    ]
  },
  {
    id: 'pre',
    name: 'PRE',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-600',
    hoverColor: 'hover:from-blue-600 hover:to-cyan-700',
    courses: [
      {
        id: 'preb',
        name: 'PREB',
        link: 'https://drive.google.com/drive/folders/1qgNqk6r8yVPhd2k4A-LN38yp_EaGu-kQ?usp=drive_link'
      },
      {
        id: 'prea',
        name: 'PREA',
        link: 'https://drive.google.com/drive/folders/19uwKfhZv14ycExnsxJfq_sz4Ryd7Wmd_?usp=drive_link'
      }
    ]
  },
  {
    id: 'arm',
    name: 'ARM',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'hover:from-emerald-600 hover:to-teal-700',
    courses: [
      {
        id: 'armb',
        name: 'ARMB',
        link: 'https://drive.google.com/drive/folders/1EIPtA-y471-bc1gEDdRt-qs5oR2YCrUW?usp=drive_link'
      }
    ]
  }
];

export default function Screen8() {
  const openLink = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative flex flex-col p-4 md:p-8 space-y-6 min-h-screen">
      {/* Decorative shapes */}
      <div className="floating-shape shape-1" />
      <div className="floating-shape shape-2" />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text tracking-tight flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 md:h-12 md:w-12" />
          Bài Tập Về Nhà
        </h1>
        <p className="text-[#cbd5e1] text-lg">
          Truy cập nhanh các bài tập về nhà theo từng khóa học
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 max-w-7xl mx-auto w-full">
        {homeworkCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card 
              key={category.id} 
              className={cn(
                "glass-card border-white/10 hover:border-white/20 transition-all duration-300",
                "hover:shadow-2xl hover:scale-[1.02]"
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className={cn(
                    "p-3 rounded-xl bg-gradient-to-r",
                    category.color,
                    "shadow-lg"
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="gradient-text">{category.name}</span>
                </CardTitle>
                <CardDescription className="text-[#cbd5e1]">
                  {category.courses.length} {category.courses.length === 1 ? 'khóa học' : 'khóa học'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.courses.map((course) => (
                  <Button
                    key={course.id}
                    onClick={() => openLink(course.link)}
                    className={cn(
                      "w-full justify-between group",
                      "bg-gradient-to-r",
                      category.color,
                      category.hoverColor,
                      "text-white border-0 shadow-lg",
                      "hover:shadow-xl transition-all duration-300",
                      "hover:scale-[1.02]"
                    )}
                    size="lg"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {course.name}
                    </span>
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="glass-card border-white/10 max-w-7xl mx-auto w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#a5b4fc] text-xl">
            <FileText className="h-5 w-5" />
            Hướng Dẫn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-[#cbd5e1]">
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Click vào tên khóa học để mở Google Drive chứa bài tập về nhà</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Tất cả các file bài tập đã được tổ chức theo từng buổi học</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Bạn có thể tải xuống hoặc xem trực tiếp trên Google Drive</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

