class WheelOfFortune {
    constructor() {
        this.options = [''];
        this.count = 1;
        this.rotation = 0;
        this.isSpinning = false;
        this.wheel = document.getElementById('wheel');
        this.arrow = document.getElementById('arrow');
        this.countValue = document.getElementById('countValue');
        this.increaseBtn = document.getElementById('increaseBtn');
        this.decreaseBtn = document.getElementById('decreaseBtn');
        this.optionInput = document.getElementById('optionInput');
        this.addBtn = document.getElementById('addBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.titleInput = document.getElementById('titleInput');
        this.selectedResult = null;
        
        this.init();
    }
    
    init() {
        this.loadFromUrl();
        this.updateCountDisplay();
        this.drawWheel();
        this.setupEventListeners();

        // URL에 결과가 있으면 자동 회전
        const urlParams = new URLSearchParams(window.location.search);
        const resultParam = urlParams.get('result');
        if (resultParam) {
            const resultIndex = this.options.indexOf(resultParam);
            if (resultIndex !== -1) {
                // 약간의 지연 후 실행 (브라우저 렌더링 준비 시간)
                setTimeout(() => this.spinWheel(resultIndex), 500);
            }
        }
    }

    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const optionsParam = urlParams.get('options');
        const titleParam = urlParams.get('title');
        
        if (titleParam) {
            this.titleInput.value = titleParam;
            document.title = this.titleInput.value;
        }

        if (optionsParam) {
            try {
                const decodedOptions = optionsParam.split(',');
                if (decodedOptions.length > 0) {
                    this.options = decodedOptions;
                    this.count = this.options.length;
                }
            } catch (e) {
                console.error('URL 파라미터 파싱 오류:', e);
            }
        }
    }
    
    setupEventListeners() {
        this.increaseBtn.addEventListener('click', () => this.increaseCount());
        this.decreaseBtn.addEventListener('click', () => this.decreaseCount());
        this.addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.addOption();
            // 키보드가 내려가지 않도록 포커스 유지
            this.optionInput.focus();
        });
        this.optionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addOption();
                // 키보드가 내려가지 않도록 포커스 유지
                this.optionInput.focus();
            }
        });
        
        // 화살표 클릭 시 회전
        this.arrow.addEventListener('click', () => this.spinWheel());
        
        // 돌림판 클릭 시 회전 (input 클릭은 제외)
        this.wheel.addEventListener('click', (e) => {
            // input이나 foreignObject가 아닌 경우에만 회전
            if (e.target.tagName !== 'input' && e.target.tagName !== 'foreignObject') {
                this.spinWheel();
            }
        });

        // 초기화 버튼
        this.resetBtn.addEventListener('click', () => this.resetWheel());

        // 공유 버튼
        this.shareBtn.addEventListener('click', () => this.shareWheel());

        // 제목 입력 시 문서 타이틀 업데이트
        this.titleInput.addEventListener('input', () => {
            document.title = this.titleInput.value;
        });
    }
    
    increaseCount() {
        if (this.count < 10) {
            this.count++;
            this.updateCountDisplay();
            this.drawWheel();
        }
    }
    
    decreaseCount() {
        if (this.count > 1) {
            this.count--;
            this.updateCountDisplay();
            this.drawWheel();
        }
    }
    
    updateCountDisplay() {
        this.countValue.textContent = this.count;
        this.increaseBtn.disabled = this.count >= 10;
        this.decreaseBtn.disabled = this.count <= 1;
        
        // 옵션 개수가 count보다 적으면 빈 옵션 추가
        while (this.options.length < this.count) {
            this.options.push('');
        }
        
        // 옵션 개수가 count보다 많으면 제거
        if (this.options.length > this.count) {
            this.options = this.options.slice(0, this.count);
        }
    }
    
    addOption() {
        const optionName = this.optionInput.value.trim();
        if (optionName === '') {
            alert('소망하는 운명을 입력해주세요.');
            return;
        }
        
        // 빈 칸이 있는지 확인
        const emptyIndex = this.options.findIndex(opt => opt === '');
        
        if (emptyIndex !== -1) {
            // 빈 칸이 있으면 해당 위치에 채움
            this.options[emptyIndex] = optionName;
            this.drawWheel();
            this.optionInput.value = '';
        } else if (this.options.length < 10) {
            // 빈 칸이 없고 10개 미만이면 새로 추가
            this.options.push(optionName);
            this.count = this.options.length;
            this.updateCountDisplay();
            this.drawWheel();
            this.optionInput.value = '';
        } else {
            alert('더 이상의 운명을 추가한다면...\n당신의 운명은 더 이상 변하지 않을 것입니다.');
            this.optionInput.value = '';
        }
    }
    
    drawWheel() {
        // 기존 내용 제거
        this.wheel.innerHTML = '';
        
        const centerX = 200;
        const centerY = 200;
        const radius = 180;
        const anglePerSection = 360 / this.count;
        
        // 색상 팔레트 (적당한 밝기의 색상)
        const colors = [
            '#E8A5A5', '#A5D4D4', '#8FC5D9', '#E8B8A5', '#A5C8C0',
            '#D9C8A5', '#C5B5D4', '#A5C5D9', '#D9B8A5', '#B5C8D9'
        ];
        
        // 각 섹션 그리기
        for (let i = 0; i < this.count; i++) {
            let path;
            
            // 1개일 때는 원 전체를 그리기
            if (this.count === 1) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', centerX);
                circle.setAttribute('cy', centerY);
                circle.setAttribute('r', radius);
                circle.setAttribute('fill', colors[0]);
                circle.setAttribute('stroke', '#fff');
                circle.setAttribute('stroke-width', '2');
                circle.classList.add('wheel-section');
                circle.dataset.index = i;
                
                circle.addEventListener('dblclick', (e) => {
                    this.editOptionDirectly(i, e);
                });
                
                this.wheel.appendChild(circle);
                path = circle;
            } else {
                const startAngle = (i * anglePerSection - 90) * Math.PI / 180;
                const endAngle = ((i + 1) * anglePerSection - 90) * Math.PI / 180;
                
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const largeArcFlag = anglePerSection > 180 ? 1 : 0;
                
                const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');
                
                const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                pathElement.setAttribute('d', pathData);
                pathElement.setAttribute('fill', colors[i % colors.length]);
                pathElement.setAttribute('stroke', '#fff');
                pathElement.setAttribute('stroke-width', '2');
                pathElement.classList.add('wheel-section');
                pathElement.dataset.index = i;
                
                pathElement.addEventListener('dblclick', (e) => {
                    this.editOptionDirectly(i, e);
                });
                
                this.wheel.appendChild(pathElement);
                path = pathElement;
            }
            
            // 텍스트 추가 (편집 가능하도록)
            const textAngle = (i * anglePerSection + anglePerSection / 2 - 90) * Math.PI / 180;
            const textRadius = radius * 0.7;
            const textX = centerX + textRadius * Math.cos(textAngle);
            const textY = centerY + textRadius * Math.sin(textAngle);
            
            // foreignObject를 사용하여 편집 가능한 텍스트 생성
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', textX - 50);
            foreignObject.setAttribute('y', textY - 20);
            foreignObject.setAttribute('width', '100');
            foreignObject.setAttribute('height', '40');
            foreignObject.setAttribute('pointer-events', 'none');
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = this.options[i] || '';
            textInput.placeholder = '입력';
            textInput.className = 'wheel-text-input';
            textInput.dataset.index = i;
            textInput.style.cssText = `
                width: 100%;
                height: 100%;
                color: white;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                background: transparent;
                border: none;
                outline: none;
                cursor: text;
                pointer-events: auto;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                padding: 0;
            `;
            
            // placeholder 스타일 설정
            textInput.style.setProperty('::placeholder', 'color: rgba(255, 255, 255, 0.6);');
            
            // hover 시 시각적 피드백
            textInput.addEventListener('mouseenter', (e) => {
                if (!e.target.value) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.border = '1px dashed rgba(255, 255, 255, 0.5)';
                    e.target.style.borderRadius = '2px';
                }
            });
            
            textInput.addEventListener('mouseleave', (e) => {
                if (document.activeElement !== e.target) {
                    e.target.style.background = 'transparent';
                    e.target.style.border = 'none';
                }
            });
            
            // 포커스 시 스타일 변경
            textInput.addEventListener('focus', (e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.border = '1px solid white';
                e.target.style.borderRadius = '2px';
            });
            
            textInput.addEventListener('blur', (e) => {
                e.target.style.background = 'transparent';
                e.target.style.border = 'none';
                const index = parseInt(e.target.dataset.index);
                const newValue = e.target.value.trim();
                this.options[index] = newValue;
                e.target.value = newValue;
            });
            
            // Enter 키로 편집 완료
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                } else if (e.key === 'Escape') {
                    const index = parseInt(e.target.dataset.index);
                    e.target.value = this.options[index] || '';
                    e.target.blur();
                }
            });
            
            // 클릭 이벤트 전파 방지
            textInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            foreignObject.appendChild(textInput);
            this.wheel.appendChild(foreignObject);
        }
    }
    
    editOptionDirectly(index, event) {
        const newName = prompt('운명을 입력하세요:', this.options[index]);
        if (newName !== null && newName.trim() !== '') {
            this.options[index] = newName.trim();
            this.drawWheel();
        }
    }
    
    
    spinWheel(targetIndex = null) {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.wheel.classList.add('spinning');
        
        // 랜덤 회전 각도 계산 (최소 3바퀴 이상)
        const spins = 3 + Math.random() * 2; // 3-5바퀴
        const anglePerSection = 360 / this.count;
        
        let targetAngle;
        if (targetIndex !== null) {
            // 특정 인덱스가 당첨되도록 각도 계산
            // 섹션의 중앙에 화살표가 오도록 함
            const sectionCenterAngle = (targetIndex * anglePerSection) + (anglePerSection / 2);
            // 휠의 0도는 3시 방향이므로, 12시 방향(화살표)에 맞추기 위해 270도 보정
            // 현재 회전 상태(this.rotation)를 고려하여 목표 각도 설정
            const currentRotationBase = Math.ceil(this.rotation / 360) * 360;
            targetAngle = currentRotationBase + (spins * 360) + (360 - sectionCenterAngle);
        } else {
            // 랜덤 회전
            const randomExtraAngle = Math.random() * 360;
            targetAngle = this.rotation + (spins * 360) + randomExtraAngle;
        }
        
        // 선택될 섹션 계산
        const finalNormalizedRotation = (360 - (targetAngle % 360)) % 360;
        const selectedIndex = Math.floor(finalNormalizedRotation / anglePerSection) % this.count;
        
        this.rotation = targetAngle;
        this.wheel.style.transform = `rotate(${this.rotation}deg)`;
        
        // 애니메이션 완료 후
        setTimeout(() => {
            this.isSpinning = false;
            this.wheel.classList.remove('spinning');
            
            // 선택된 옵션 알림
            const selectedOption = this.options[selectedIndex] || '';
            if (selectedOption) {
                this.selectedResult = selectedOption; // 결과 저장
                alert(`당신의 운명은 ${selectedOption} 입니다.`);
            }
        }, 3000);
    }

    resetWheel() {
        if (confirm('돌림판을 초기화 하시겠습니까?')) {
            this.options = [''];
            this.count = 1;
            this.updateCountDisplay();
            this.drawWheel();
            this.optionInput.value = '';
            this.titleInput.value = '운명의 수레바퀴';
            document.title = '운명의 수레바퀴';
            this.selectedResult = null;
            
            // URL 파라미터 제거
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    shareWheel() {
        // 실제 내용이 있는 옵션들만 추출
        const validOptions = this.options.filter(opt => opt.trim() !== '');
        const title = this.titleInput.value.trim();
        
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();

        if (title && title !== '운명의 수레바퀴') {
            params.set('title', title);
        }

        if (validOptions.length > 0) {
            params.set('options', validOptions.join(','));
        }

        if (this.selectedResult && validOptions.includes(this.selectedResult)) {
            params.set('result', this.selectedResult);
        }

        const queryString = params.toString();
        const shareUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        // 클립보드 복사
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('공유 URL이 클립보드에 복사되었습니다!\n친구에게 당신의 운명을 공유해보세요.');
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            // 폴백: prompt로 보여주기
            prompt('공유 URL입니다. 복사해서 사용하세요:', shareUrl);
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WheelOfFortune();
});

