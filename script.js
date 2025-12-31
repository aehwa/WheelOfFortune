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
        
        this.init();
    }
    
    init() {
        this.updateCountDisplay();
        this.drawWheel();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.increaseBtn.addEventListener('click', () => this.increaseCount());
        this.decreaseBtn.addEventListener('click', () => this.decreaseCount());
        this.addBtn.addEventListener('click', () => this.addOption());
        this.optionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOption();
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
        
        if (this.options.length < 10) {
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
            foreignObject.setAttribute('x', textX - 80);
            foreignObject.setAttribute('y', textY - 15);
            foreignObject.setAttribute('width', '160');
            foreignObject.setAttribute('height', '30');
            foreignObject.setAttribute('pointer-events', 'none');
            
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = this.options[i] || '';
            textInput.placeholder = '운명의 선택지';
            textInput.className = 'wheel-text-input';
            textInput.dataset.index = i;
            textInput.style.cssText = `
                width: 100%;
                height: 100%;
                color: white;
                font-size: 16px;
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
                    e.target.style.borderRadius = '4px';
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
                e.target.style.border = '2px solid white';
                e.target.style.borderRadius = '4px';
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
    
    
    spinWheel() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.wheel.classList.add('spinning');
        
        // 랜덤 회전 각도 계산 (최소 3바퀴 이상)
        const spins = 3 + Math.random() * 2; // 3-5바퀴
        const randomAngle = Math.random() * 360;
        const totalRotation = this.rotation + spins * 360 + randomAngle;
        
        // 선택될 섹션 계산
        const normalizedRotation = (360 - (totalRotation % 360)) % 360;
        const anglePerSection = 360 / this.count;
        const selectedIndex = Math.floor(normalizedRotation / anglePerSection);
        
        this.rotation = totalRotation;
        this.wheel.style.transform = `rotate(${this.rotation}deg)`;
        
        // 애니메이션 완료 후
        setTimeout(() => {
            this.isSpinning = false;
            this.wheel.classList.remove('spinning');
            
            // 선택된 옵션 알림
            const selectedOption = this.options[selectedIndex] || '';
            if (selectedOption) {
                alert(`당신의 운명은 ${selectedOption} 입니다.`);
            }
        }, 3000);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WheelOfFortune();
});

