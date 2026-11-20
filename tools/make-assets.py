#!/usr/bin/env python3
"""生成站点位图资源：og.png（1200×630）、apple-touch-icon.png（180×180）。

用法：python3 tools/make-assets.py
依赖：Pillow（本机已装）。字体取自 macOS 系统。
"""
import os

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

PAPER = (244, 241, 233)
INK = (22, 24, 27)
MUTED = (107, 106, 99)
FAINT = (150, 148, 138)
ACCENT = (176, 57, 42)
HAIR = (207, 201, 188)

SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"


def songti(size, index=3):
    return ImageFont.truetype(SONGTI, size, index=index)


def arial(size):
    return ImageFont.truetype(ARIAL, size)


def tracked(draw, xy, text, font, fill, tracking=0.0):
    """按字距逐字绘制，返回结束 x。"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def phone(path, height, radius=16):
    im = Image.open(path).convert("RGB")
    w = round(im.width * height / im.height)
    im = im.resize((w, height), Image.Resampling.LANCZOS)
    mask = Image.new("L", (w, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, height - 1], radius=radius, fill=255)
    out = Image.new("RGB", (w, height), (255, 255, 255))
    out.paste(im, (0, 0), mask)
    return out, mask


def mark(draw, x, y, size, fg, bg=None):
    """方舟标记：圆角方框 + 桅杆 + 帆 + 水线。"""
    r = round(size * 0.2)
    if bg:
        draw.rounded_rectangle([x, y, x + size, y + size], radius=r, fill=bg)
    else:
        draw.rounded_rectangle([x, y, x + size, y + size], radius=r, outline=fg, width=max(1, round(size / 22)))
    s = size
    m = s * 0.5
    draw.line([(x + m, y + s * 0.22), (x + m, y + s * 0.68)], fill=fg, width=max(1, round(s / 22)))
    draw.polygon(
        [(x + m, y + s * 0.22), (x + s * 0.75, y + s * 0.68), (x + m, y + s * 0.68)],
        fill=fg,
    )
    draw.line([(x + s * 0.24, y + s * 0.78), (x + s * 0.76, y + s * 0.78)], fill=fg, width=max(1, round(s / 22)))


def make_og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)

    d.rectangle([28, 28, W - 29, H - 29], outline=HAIR, width=1)

    # 品牌行
    mark(d, 72, 62, 36, INK)
    tracked(d, (122, 64), "云枢方舟", songti(25, 1), INK, tracking=1.5)
    tracked(d, (122, 96), "YUNSHU ARK", arial(10), FAINT, tracking=3.0)

    # 标题
    d.text((70, 150), "把想法，", font=songti(84, 3), fill=INK)
    d.text((70, 244), "做成产品。", font=songti(84, 3), fill=ACCENT)

    # 说明
    d.text((72, 372), "自研移动应用与 Web / 3D 产品", font=songti(23, 4), fill=MUTED)
    d.text((72, 408), "Independent mobile and web products, designed and built in-house.", font=arial(14), fill=FAINT)

    # 分隔线
    d.line([(72, 468), (W - 72, 468)], fill=HAIR, width=1)
    d.text((72, 492), "广州云枢方舟科技有限公司", font=songti(17, 1), fill=INK)
    d.text((72, 519), "Guangzhou Yunshu Ark Technology Co., Ltd.", font=arial(12), fill=MUTED)
    tracked(d, (72, 552), "YSFANGZHOU.XYZ", arial(10), FAINT, tracking=2.4)

    # 右侧：两台手机
    left, _ = phone(os.path.join(IMG, "vivace-01.jpg"), 400)
    right, _ = phone(os.path.join(IMG, "palmglow-01.jpg"), 400)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([706, 150, 706 + left.width + 10, 150 + left.height + 12], radius=20, fill=(22, 24, 27, 40))
    sd.rounded_rectangle([934, 190, 934 + right.width + 10, 190 + right.height + 12], radius=20, fill=(22, 24, 27, 40))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    im = Image.alpha_composite(im.convert("RGBA"), shadow).convert("RGB")

    im.paste(left, (714, 140))
    im.paste(right, (942, 180))

    im.save(os.path.join(ROOT, "assets", "og.png"), optimize=True)
    print("assets/og.png", im.size)


def make_icon(size=180):
    im = Image.new("RGB", (size, size), INK)
    d = ImageDraw.Draw(im)
    # 墨底纸色标记，不加圆角（iOS 自己切）
    s = size * 0.62
    x = (size - s) / 2
    y = (size - s) / 2
    mark(d, x, y, s, PAPER)
    im.save(os.path.join(ROOT, "assets", "apple-touch-icon.png"), optimize=True)
    print("assets/apple-touch-icon.png", im.size)


if __name__ == "__main__":
    make_og()
    make_icon()
