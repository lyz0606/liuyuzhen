// API服务类
class ApiService {
    constructor() {
        this.baseUrl = 'https://api.example.com'; // 替换为真实API地址
        this.cache = new Map();
    }
    
    // 获取天气信息
    async getWeather(city = 'Animal City') {
        const cacheKey = `weather_${city}`;
        
        // 检查缓存
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
                return cached.data;
            }
        }
        
        try {
            // 这里使用模拟数据，实际项目中可以连接真实API
            const mockData = {
                city: "疯狂动物城",
                temperature: 22,
                condition: "晴朗",
                humidity: 65,
                windSpeed: 12,
                icon: "☀️"
            };
            
            // 模拟API延迟
            await this.delay(800);
            
            // 缓存数据
            this.cache.set(cacheKey, {
                data: mockData,
                timestamp: Date.now()
            });
            
            return mockData;
        } catch (error) {
            console.error('获取天气信息失败:', error);
            throw error;
        }
    }
    
    // 获取新闻动态
    async getNews() {
        const cacheKey = 'news';
        
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 600000) { // 10分钟缓存
                return cached.data;
            }
        }
        
        try {
            // 模拟新闻数据
            const mockNews = [
                {
                    id: 1,
                    title: "《疯狂动物城2》制作确认！",
                    excerpt: "迪士尼正式宣布将制作《疯狂动物城》续集，预计2026年上映。",
                    date: "2025-12-20",
                    category: "电影新闻"
                },
                {
                    id: 2,
                    title: "疯狂动物城主题乐园即将开幕",
                    excerpt: "全球首个疯狂动物城主题乐园将在上海迪士尼度假区盛大开幕。",
                    date: "2025-12-18",
                    category: "乐园新闻"
                },
                {
                    id: 3,
                    title: "朱迪和尼克将推出衍生剧集",
                    excerpt: "迪士尼+将推出以朱迪和尼克为主角的衍生动画剧集。",
                    date: "2025-12-15",
                    category: "剧集新闻"
                }
            ];
            
            await this.delay(600);
            
            this.cache.set(cacheKey, {
                data: mockNews,
                timestamp: Date.now()
            });
            
            return mockNews;
        } catch (error) {
            console.error('获取新闻失败:', error);
            throw error;
        }
    }
    
    // 获取角色详情
    async getCharacterDetails(id) {
        const cacheKey = `character_${id}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            // 从本地JSON文件加载
            const response = await fetch('data/characters.json');
            const characters = await response.json();
            const character = characters.find(c => c.id === id);
            
            if (character) {
                this.cache.set(cacheKey, character);
                return character;
            }
            
            throw new Error('角色未找到');
        } catch (error) {
            console.error('获取角色详情失败:', error);
            throw error;
        }
    }
    
    // 提交表单数据
    async submitFormData(formData) {
        try {
            // 模拟API提交
            await this.delay(1200);
            
            return {
                success: true,
                message: '提交成功',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw error;
        }
    }
    
    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 创建全局API服务实例
window.apiService = new ApiService();