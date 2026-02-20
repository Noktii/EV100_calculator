document.addEventListener('DOMContentLoaded', () => {
    let isLongExposure = false;

    const modeBtn = document.getElementById('modeBtn');
    const calcBtn = document.getElementById('calcBtn');
    const shutterInput = document.getElementById('shutter');
    const hintText = document.getElementById('hintText');

	
    const bgScene = document.getElementById('bgScene');
    const motionBlurStdDev = document.getElementById('motionBlurStdDev');

    // 1. 장노출 모드
    modeBtn.addEventListener('click', () => {
        isLongExposure = !isLongExposure;
        
        if (isLongExposure) {
            modeBtn.innerText = "1초 이상 ON";
            modeBtn.classList.add('active');
            hintText.innerText = "* n 입력 시 n초로 직접 계산됩니다.";
            shutterInput.value = "4";
        } else {
            modeBtn.innerText = "1초 이상 OFF";
            modeBtn.classList.remove('active');
            hintText.innerText = "* n 입력 시 1/n초로 계산됩니다.";
            shutterInput.value = "125";
        }
    });

    // 2. ev100 계산
    calcBtn.addEventListener('click', () => {
        const iso = parseFloat(document.getElementById('iso').value);
        const f = parseFloat(document.getElementById('aperture').value);
        const sRaw = shutterInput.value.trim();
        const resDiv = document.getElementById('result');

        let s;
        if (isLongExposure) {
            s = parseFloat(sRaw);
        } else {
            if (sRaw.includes('/')) {
                const p = sRaw.split('/');
                s = parseFloat(p[0]) / parseFloat(p[1]);
            } else {
                s = 1 / parseFloat(sRaw);
            }
        }

        if (isNaN(iso) || isNaN(f) || isNaN(s) || iso <= 0 || f <= 0 || s <= 0) {
            resDiv.innerText = "!";
			resDiv.style.color = "#000000";
			document.getElementById('recommendBox').style.display = "none";
			document.getElementById('envBox').style.display = "none";
            return;	
        }

        const ev100 = Math.log2(f * f / s) - Math.log2(iso / 100);
        resDiv.innerText = ev100.toFixed(2);

        updateGuide(ev100);
		updateVisualization(f, s);
    });

	// 3. 시각화
	function updateVisualization(f, s) {
        // 조리개 part - 가우시안 블러
        const blurAmount = Math.max(0, (20 / f) - 1.5);
        bgScene.style.filter = `blur(${blurAmount}px)`;

        // 셔터스피드 part - 모션블러 - svg
        const motionBlurAmount = Math.min(40, s * 30);    // 계수 조정

        motionBlurStdDev.setAttribute("stdDeviation", `${motionBlurAmount} 0`);    // y 0으로 고정, x만 변경
    }


    // 4. 추천문구
    function updateGuide(ev) {
        const recBox = document.getElementById('recommendBox');
        const envBox = document.getElementById('envBox');
        const envTitle = document.getElementById('envTitle');
        const envDesc = document.getElementById('envDesc');
        const resDiv = document.getElementById('result');

        let recommend = "", title = "", desc = "", numColor = "#444";
        let recBgColor = "#fff9db"; 
        let recTextColor = "#d9480f";
        let recBorderColor = "#ffca28";

        const evRound = Math.round(ev);

		// 색 변화
        if (evRound >= 16) {
            numColor = "#e74c3c"; 
            recBgColor = "#e74c3c";
            recTextColor = "#ffffff";
            recBorderColor = "#c0392b";
            recommend = "매우 밝음: 고속 셔터나 좁은 조리개를 사용하세요.";
            title = "눈 부신 설원, 모래사장, 아주 밝은 태양광";
            desc = "빛이 너무 강해 화이트아웃이 발생할 수 있는 환경입니다.";
        } else if (evRound == 15) {
            numColor = "#F39C12";
            recommend = "쾌청한 낮: Sunny 16 법칙의 기준이 되는 날씨입니다.";
            title = "구름 없는 맑은 날";
            desc = "태양광이 가장 직접적이고 강하게 내리쬐는 상태입니다.";
        } else if (evRound == 14) {
            numColor = "#E67E22";
            recommend = "약간 흐린 낮: 부드러운 그림자가 생기는 빛입니다.";
            title = "얇은 구름이 낀 맑은 날";
            desc = "직사광선이 구름에 살짝 걸러져 촬영하기 좋은 조건입니다.";
        } else if (evRound >= 12) {
            numColor = "#2ECC71";
            recommend = "적정 노출: 흐린 날씨나 일몰 전후의 빛입니다.";
            title = "흐린 날 / 해 질 녘";
            desc = "짙은 구름이 있거나 골든 아워의 은은한 조명 상태입니다.";
        } else if (evRound >= 10) {
            numColor = "#27AE60";
            recommend = "조명 주의: 실내 창가나 깊은 그늘진 곳입니다.";
            title = "밝은 실내 / 그늘";
            desc = "낮 시간의 건물 내부나 깊은 나무 그늘 아래입니다.";
        } else if (evRound >= 7) {
            numColor = "#3498DB";
            recommend = "흔들림 주의: 셔터 스피드 확보가 중요합니다.";
            title = "일반적인 실내";
            desc = "가정집 거실이나 일반적인 사무실의 인공 조명 환경입니다.";
        } else {
            numColor = evRound < 4 ? "#8E44AD" : "#2980B9";    // 3항
            recBgColor = "#e74c3c";
            recTextColor = "#ffffff";
            recBorderColor = "#c0392b";

            if (evRound >= 4) {
                recommend = "저조도: 삼각대 사용을 강력히 권장합니다.";
                title = "어두운 실내 / 야경";
                desc = "카페 조명이나 가로등이 밝은 도시의 밤거리입니다.";
            } else if (evRound >= 2) {
                recommend = "장노출: 고감도 ISO나 장노출 촬영이 필수입니다.";
                title = "밤의 거리";
                desc = "가로등 아래 혹은 어두운 야외 환경입니다.";
            } else {
                recommend = "매우 어두움: 벌브(B) 모드 촬영을 고려하세요.";
                title = "달빛 아래 / 별 궤적";
                desc = "육안으로도 피사체 구분이 어려운 아주 어두운 상태입니다.";
            }
        }

        resDiv.style.color = numColor;
        recBox.style.backgroundColor = recBgColor;
        recBox.style.color = recTextColor;
        recBox.style.borderLeftColor = recBorderColor;
        recBox.innerText = recommend;
        envTitle.innerText = title;
        envDesc.innerText = desc;

        recBox.style.display = "block";
        envBox.style.display = "block";
    }
});