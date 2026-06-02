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
        this.historyList = document.getElementById('historyList');
        this.historyContainer = document.getElementById('historyContainer');
        this.selectedResult = null;
        this.history = [];
        
        this.init();
    }
    
    init() {
        this.loadFromUrl();
        this.updateCountDisplay();
        this.drawWheel();
        this.setupEventListeners();
        this.updateHistoryDisplay();

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
        this.increaseBtn.disabled = this.isSpinning || this.count >= 10;
        this.decreaseBtn.disabled = this.isSpinning || this.count <= 1;
        
        // 선택지 구성이 변경되므로 기존 결과 초기화
        this.selectedResult = null;
        
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
        const inputVal = this.optionInput.value.trim();
        if (inputVal === '') {
            alert('소망하는 운명을 입력해주세요.');
            return;
        }

        // 콤마로 분리하여 배열 생성
        const newOptions = inputVal.split(',').map(opt => opt.trim()).filter(opt => opt !== '');

        if (newOptions.length === 0) {
            alert('올바른 운명을 입력해주세요.');
            return;
        }

        let addedCount = 0;
        let limitReached = false;

        for (const optionName of newOptions) {
            // 빈 칸이 있는지 확인
            const emptyIndex = this.options.findIndex(opt => opt === '');
            
            if (emptyIndex !== -1) {
                // 빈 칸이 있으면 해당 위치에 채움
                this.options[emptyIndex] = optionName;
                addedCount++;
            } else if (this.options.length < 10) {
                // 빈 칸이 없고 10개 미만이면 새로 추가
                this.options.push(optionName);
                this.count = this.options.length;
                this.updateCountDisplay();
                addedCount++;
            } else {
                limitReached = true;
                break;
            }
        }

        if (addedCount > 0) {
            this.selectedResult = null; // 결과 초기화
            this.drawWheel();
        }

        if (limitReached) {
            alert('더 이상의 운명을 추가한다면...\n당신의 운명은 더 이상 변하지 않을 것입니다. (최대 10개)');
        }

        this.optionInput.value = '';
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
                
                // 값이 변경되었을 때만 초기화
                if (this.options[index] !== newValue) {
                    this.options[index] = newValue;
                    this.selectedResult = null;
                }
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
            this.selectedResult = null; // 결과 초기화
            this.drawWheel();
        }
    }
    
    
    spinWheel(targetIndex = null) {
        if (this.isSpinning) return;
        
        // 모든 선택지가 채워져 있는지 확인
        const allOptionsFilled = this.options.every(opt => opt.trim() !== '');
        if (!allOptionsFilled) {
            alert('모든 선택지 칸을 채워주세요! 빈 칸이 있으면 운명을 결정할 수 없습니다.');
            return;
        }
        
        this.isSpinning = true;
        this.setControlsDisabled(true);
        this.wheel.classList.add('spinning');
        
        const spins = 5; // 일관된 회전감을 위해 5바퀴로 고정
        const anglePerSection = 360 / this.count;
        
        let finalTargetIndex;
        if (targetIndex !== null) {
            finalTargetIndex = targetIndex;
        } else {
            // 랜덤일 경우 여기서 당첨 인덱스 먼저 확정
            finalTargetIndex = Math.floor(Math.random() * this.count);
        }

        // 당첨된 섹션의 중앙 각도 (12시 방향 기준 0도부터 시계방향으로 계산)
        const sectionCenterAngle = (finalTargetIndex * anglePerSection) + (anglePerSection / 2);
        
        // 수동 회전(targetIndex === null)일 때만 랜덤 오프셋 추가 (자연스러운 느낌을 위해)
        let randomOffset = 0;
        if (targetIndex === null) {
            // 섹션 너비의 80% 범위 내에서 랜덤하게 멈춤
            randomOffset = (Math.random() - 0.5) * (anglePerSection * 0.8);
        }

        // 현재 회전된 각도에서 다음 목표 각도까지의 차이 계산
        const currentRotation = this.rotation;
        const baseRotation = Math.ceil(currentRotation / 360) * 360;
        const targetAngle = baseRotation + (spins * 360) - sectionCenterAngle + randomOffset;
        
        // 결과값 미리 저장
        this.selectedResult = this.options[finalTargetIndex] || '';
        
        this.rotation = targetAngle;
        this.wheel.style.transform = `rotate(${this.rotation}deg)`;
        
        // 애니메이션 완료 후 실행
        setTimeout(() => {
            this.isSpinning = false;
            this.setControlsDisabled(false);
            this.wheel.classList.remove('spinning');
            
            if (this.selectedResult) {
                this.addHistory(this.selectedResult);
                alert(`당신의 운명은 ${this.selectedResult} 입니다.`);
            }
        }, 3000);
    }

    setControlsDisabled(disabled) {
        this.increaseBtn.disabled = disabled || this.count >= 10;
        this.decreaseBtn.disabled = disabled || this.count <= 1;
        this.optionInput.disabled = disabled;
        this.addBtn.disabled = disabled;
        this.resetBtn.disabled = disabled;
        this.shareBtn.disabled = disabled;
        this.titleInput.disabled = disabled;
        
        // 휠과 화살표 클릭 방지
        this.wheel.style.pointerEvents = disabled ? 'none' : 'auto';
        this.arrow.style.pointerEvents = disabled ? 'none' : 'auto';
        
        // 비활성화 시 시각적 피드백 (opacity 등)
        const controls = document.querySelector('.controls');
        const titleInput = document.querySelector('.title-input');
        if (disabled) {
            controls.style.opacity = '0.5';
            titleInput.style.opacity = '0.5';
        } else {
            controls.style.opacity = '1';
            titleInput.style.opacity = '1';
        }
    }

    addHistory(result) {
        this.history.push(result);
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyList.innerHTML = '';
        
        // 최신순으로 보여주기 위해 배열을 뒤집어서 렌더링
        const reversedHistory = [...this.history].reverse();
        
        reversedHistory.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            // 전체 개수에서 차감하여 넘버링 (최신 항목이 큰 번호)
            const originalIndex = this.history.length - index;
            li.innerHTML = `<span class="item-num">${originalIndex}.</span> ${item}`;
            this.historyList.appendChild(li);
        });
        
        // 최신 항목이 상단(또는 왼쪽)에 오므로 스크롤을 항상 처음으로 고정
        this.historyList.scrollTop = 0;
        this.historyList.scrollLeft = 0;

        // 히스토리가 없으면 숨기기
        if (this.history.length === 0) {
            this.historyContainer.style.display = 'none';
        } else {
            this.historyContainer.style.display = 'flex';
        }
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
            this.history = [];
            this.updateHistoryDisplay();
            
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
    window.wheel = new WheelOfFortune();
});

