# Frequently-Asked-Questions

## FAQ 답변 이미지 추가

이미지 파일을 `public/images/`에 넣은 뒤, 해당 FAQ 선택지의 `images` 배열에 경로를 추가합니다. 이미지가 여러 장이면 배열에 계속 추가할 수 있습니다.

```js
{
	text: "수험표를 반드시 출력해 가야 하나요?",
	answer: "모바일 앱 내 수험표 화면 제시로도 대체 가능합니다.",
	images: [
		{ src: "/images/mobile-ticket.png", alt: "모바일 수험표 화면 예시" },
		{ src: "/images/ticket-details.jpg", alt: "수험표 확인 위치" }
	]
}
```

`images`를 생략하거나 빈 배열로 두면 기본 정사각형 이미지가 표시됩니다. 각 항목은 `"/images/example.jpg"`처럼 경로 문자열로만 지정해도 됩니다.