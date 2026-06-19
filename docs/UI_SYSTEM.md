# UI System

## Type scale

Ứng dụng sử dụng thang chữ cố định:

- Caption: 12px
- Small / label / control: 14px
- Body: 16px
- Lead: 18px
- Section heading: 20px
- Card heading: 24px
- Page subheading: 30px
- Page heading: 32–48px responsive

Các class semantic nằm trong `app/globals.css`:

- `page-eyebrow`
- `page-title`
- `page-lead`
- `section-title`
- `label-text`
- `caption-text`

Không sử dụng font nhỏ hơn 12px.

## Table

Mọi bảng dùng:

```tsx
<div className="data-table-shell">
  <table className="app-table">...</table>
</div>
```

Biến thể:

- `checkout-table`: bảng checkout nhiều cột.
- `rubric-table`: bảng rubric.
- `timeline-table`: bảng timeline.

Table header sticky, cột đầu sticky, zebra rows và cuộn ngang trên màn hình nhỏ.
