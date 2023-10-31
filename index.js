const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const { pipe, take, join } = require('@fxts/core');
// 360 × 468 px
const app = express();

const sliceTextByLength = (text, len) => pipe(
    text,
    take(len),
    join('')
);
const getTopStickerText = (text) => {
    const DEFAULT = '전단특가';
    if (!text) {
        return DEFAULT;
    }
    return sliceTextByLength(text, 4);
};

const getBottomStickerText = (text) => {
    const DEFAULT = '10%쿠폰 + 카드할인';
    if (!text) {
        return DEFAULT;
    }
    return sliceTextByLength(text, 12);
}


app.get('/', async (req, res) => {
    const { query } = req;
    const { imageUrl, stickerPosition, stickerTopColor, stickerTopText, stickerBottomText } = query;
    const canvas = createCanvas(360, 468);
    const ctx = canvas.getContext('2d');
    const image = await loadImage(imageUrl || 'https://product-image.kurly.com/cdn-cgi/image/fit=crop,width=360,height=468,quality=85/product/image/886979dd-8ed5-4085-803e-401f1a6669e9.jpg');
    const TOP_STICKER_TEXT = getTopStickerText(stickerTopText);
    const BOTTOM_STICKER_TEXT = getBottomStickerText(stickerBottomText);
    ctx.drawImage(image, 0, 0, 360, 468);

    // 상단 스티커 - 영역
    // TODO: 가변 텍스트 길이 대응 - 텍스트의 길이에 따른 너비 증가
    ctx.beginPath();
    ctx.strokeStyle = "rgb(189, 118, 255)";
    ctx.fillStyle = stickerTopColor ||"rgb(189, 118, 255)";
    ctx.roundRect(20, 20, 100, 35, 4);
    ctx.stroke();
    ctx.fill();

    // 상단 스티커 - 텍스트
    // TODO: 가변 텍스트 길이 대응 - 영역의 중앙 정렬
    ctx.font = 'bold 1rem "Fira Sans", sans-serif'
    ctx.fillStyle = "#ffffff";
    ctx.fillText(TOP_STICKER_TEXT, 32.5, 45);

    // 하단 스티커 - 영역
    // TODO: 가변 텍스트 길이 대응 - 텍스트의 길이에 따른 너비 증가
    ctx.filter = 'blur(10px)';
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 400, 360, 68);

    // 하단 스티커 - 텍스트 - 영역의 중앙 정렬
    ctx.fillStyle = "#ffffff";
    ctx.fillText(BOTTOM_STICKER_TEXT, 90, 440);

    const imageStream = canvas.createJPEGStream({
        progressive: true,
    });
    res.setHeader('Content-Type', 'image/jpeg');
    imageStream.pipe(res);
});

const run = () => {
    app.listen(3000);
    console.log('server started :3000');
}

run();