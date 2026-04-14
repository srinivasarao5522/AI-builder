import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const UI_TRANSLATIONS: any = {
  'English': {
    title: 'AI Resume Builder',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'Conversational Assistant',
    chatSubtitle: 'Chat, speak, or drop a document to build your resume.',
    uploadZone: 'Upload Word, PDF, or PPT',
    typePlaceholder: 'Type a message (e.g. "I am a data analyst at Google")',
    btnSend: '➤',
    tabPreview: 'Live Preview',
    tabEdit: 'Human Review & Edit',
    btnAutoSuggest: '✨ Auto Suggest Template',
    noTemplate: 'No Template Selected',
    noTemplateDesc: 'Start chatting to build your profile, upload a document, or click a template above to see the live rendering.',
    formTitle: 'Validate & Edit Schema',
    formDesc: 'Modify the parsed canonical model manually here. Changes reflect instantly.',
    lblFullName: 'Full Name',
    lblEmail: 'Email',
    lblPhone: 'Phone',
    lblSummary: 'Professional Summary',
    lblExp: 'Experience',
    lblEdu: 'Education',
    lblSkills: 'Skills (Comma separated list)',
    btnAddRole: '+ Add Role',
    btnAddEdu: '+ Add Education',
    phTitle: 'Job Title',
    phCompany: 'Company Name',
    phDates: 'Dates (e.g. 2020 - Present)',
    phDesc: 'Description/Responsibilities',
    phDegree: 'Degree',
    phInst: 'Institution',
    phSkills: 'JS, SQL, React...'
  },
  'Spanish': {
    title: 'Constructor de CV IA',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'Asistente Conversacional',
    chatSubtitle: 'Chatea, habla o sube un documento para construir tu currículum.',
    uploadZone: 'Subir Word, PDF o PPT',
    typePlaceholder: 'Escribe un mensaje...',
    btnSend: '➤',
    tabPreview: 'Vista Previa',
    tabEdit: 'Revisión Humana y Edición',
    btnAutoSuggest: '✨ Sugerir Plantilla',
    noTemplate: 'Ninguna plantilla seleccionada',
    noTemplateDesc: 'Empieza a chatear o selecciona una plantilla arriba.',
    formTitle: 'Validar y Editar Esquema',
    formDesc: 'Modifica el modelo manualmente aquí.',
    lblFullName: 'Nombre Completo',
    lblEmail: 'Correo',
    lblPhone: 'Teléfono',
    lblSummary: 'Resumen Profesional',
    lblExp: 'Experiencia',
    lblEdu: 'Educación',
    lblSkills: 'Habilidades (separadas por comas)',
    btnAddRole: '+ Añadir Rol',
    btnAddEdu: '+ Añadir Educación',
    phTitle: 'Cargo',
    phCompany: 'Empresa',
    phDates: 'Fechas',
    phDesc: 'Descripción',
    phDegree: 'Grado',
    phInst: 'Institución',
    phSkills: 'JS, SQL, React...'
  },
  'French': {
    title: 'Créateur de CV IA',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'Assistant Conversationnel',
    chatSubtitle: 'Discutez, parlez ou déposez un document.',
    uploadZone: 'Télécharger Word, PDF ou PPT',
    typePlaceholder: 'Tapez un message...',
    btnSend: '➤',
    tabPreview: 'Aperçu en direct',
    tabEdit: 'Révision Humaine',
    btnAutoSuggest: '✨ Suggérer Modèle',
    noTemplate: 'Aucun modèle sélectionné',
    noTemplateDesc: 'Commencez à discuter pour créer votre profil.',
    formTitle: 'Valider et Éditer',
    formDesc: 'Modifiez manuellement le modèle ici.',
    lblFullName: 'Nom Complet',
    lblEmail: 'E-mail',
    lblPhone: 'Téléphone',
    lblSummary: 'Résumé Professionnel',
    lblExp: 'Expérience',
    lblEdu: 'Éducation',
    lblSkills: 'Compétences',
    btnAddRole: '+ Ajouter Rôle',
    btnAddEdu: '+ Ajouter Éducation',
    phTitle: 'Titre du poste',
    phCompany: 'Entreprise',
    phDates: 'Dates',
    phDesc: 'Description',
    phDegree: 'Diplôme',
    phInst: 'Institution',
    phSkills: 'JS, SQL, React...'
  },
  'German': {
    title: 'KI Lebenslauf Ersteller',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'Gesprächsassistent',
    chatSubtitle: 'Chatten, sprechen oder ein Dokument hochladen.',
    uploadZone: 'Word, PDF oder PPT hochladen',
    typePlaceholder: 'Geben Sie eine Nachricht ein...',
    btnSend: '➤',
    tabPreview: 'Live-Vorschau',
    tabEdit: 'Menschliche Überprüfung',
    btnAutoSuggest: '✨ Vorlage vorschlagen',
    noTemplate: 'Keine Vorlage ausgewählt',
    noTemplateDesc: 'Beginnen Sie zu chatten, um Ihr Profil zu erstellen.',
    formTitle: 'Schema überprüfen',
    formDesc: 'Ändern Sie das geparste Modell manuell.',
    lblFullName: 'Vollständiger Name',
    lblEmail: 'E-Mail',
    lblPhone: 'Telefon',
    lblSummary: 'Berufliche Zusammenfassung',
    lblExp: 'Erfahrung',
    lblEdu: 'Bildung',
    lblSkills: 'Fähigkeiten',
    btnAddRole: '+ Rolle hinzufügen',
    btnAddEdu: '+ Bildung hinzufügen',
    phTitle: 'Berufsbezeichnung',
    phCompany: 'Unternehmen',
    phDates: 'Daten',
    phDesc: 'Beschreibung',
    phDegree: 'Abschluss',
    phInst: 'Institution',
    phSkills: 'JS, SQL...'
  },
  'Hindi': {
    title: 'एआई रेज़्यूमे बिल्डर',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'संवादी सहायक',
    chatSubtitle: 'चैट करें, बोलें या दस्तावेज़ अपलोड करें।',
    uploadZone: 'वर्ड, पीडीएफ या पीपीटी अपलोड करें',
    typePlaceholder: 'एक संदेश लिखें...',
    btnSend: '➤',
    tabPreview: 'लाइव प्रीव्यू',
    tabEdit: 'समीक्षा और संपादन',
    btnAutoSuggest: '✨ टेम्पलेट का सुझाव दें',
    noTemplate: 'कोई टेम्पलेट चयनित नहीं है',
    noTemplateDesc: 'अपनी प्रोफ़ाइल बनाने के लिए चैट शुरू करें।',
    formTitle: 'सत्यापित और संपादित करें',
    formDesc: 'कैनोनिकल मॉडल को मैन्युअल रूप से संशोधित करें।',
    lblFullName: 'पूरा नाम',
    lblEmail: 'ईमेल',
    lblPhone: 'फ़ोन',
    lblSummary: 'पेशेवर सारांश',
    lblExp: 'अनुभव',
    lblEdu: 'शिक्षा',
    lblSkills: 'कौशल',
    btnAddRole: '+ भूमिका जोड़ें',
    btnAddEdu: '+ शिक्षा जोड़ें',
    phTitle: 'पद का नाम',
    phCompany: 'कंपनी',
    phDates: 'तिथियां',
    phDesc: 'विवरण',
    phDegree: 'डिग्री',
    phInst: 'संस्थान',
    phSkills: 'JS, SQL...'
  },
  'Chinese': {
    title: 'AI 简历生成器',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: '会话助手',
    chatSubtitle: '聊天、语音或上传文档来构建简历。',
    uploadZone: '上传 Word, PDF 或 PPT',
    typePlaceholder: '输入信息...',
    btnSend: '➤',
    tabPreview: '实时预览',
    tabEdit: '人工校对与编辑',
    btnAutoSuggest: '✨ 智能推荐模板',
    noTemplate: '未选择模板',
    noTemplateDesc: '开始聊天或上传文档来生成简历。',
    formTitle: '验证和编辑规范模型',
    formDesc: '在这里手动修改模型。',
    lblFullName: '姓名',
    lblEmail: '邮箱',
    lblPhone: '电话',
    lblSummary: '个人简介',
    lblExp: '工作经验',
    lblEdu: '教育背景',
    lblSkills: '技能 (逗号分隔)',
    btnAddRole: '+ 添加职位',
    btnAddEdu: '+ 添加教育背景',
    phTitle: '职位名称',
    phCompany: '公司',
    phDates: '时间',
    phDesc: '描述',
    phDegree: '学位',
    phInst: '机构',
    phSkills: 'JS, SQL, React...'
  }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  // View state
  activeTab: 'preview' | 'edit' = 'preview';

  // Chat State
  messages: ChatMessage[] = [];
  userInput: string = '';
  isRecording: boolean = false;
  isLoading: boolean = false;
  
  // Audio
  mediaRecorder: any = null;
  audioChunks: any[] = [];
  nativeSpeechRecognition: any = null;

  // CV Data Canonical Schema
  cvData: any = {
    name: '', email: '', phone: '', summary: '',
    experience: [], education: [], skills: []
  };

  // Templates & Suggestions
  templates: any[] = [];
  selectedTemplate: any = null;
  companyLogoUrl: string = 'https://ui-avatars.com/api/?name=Company+Logo&background=0D8ABC&color=fff&size=128';
  
  // Settings & i18n
  language: string = 'English';
  languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese'];
  t: any = UI_TRANSLATIONS['English']; // active translation dict
  
  backendUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.addMessage('assistant', 'Welcome! I am your AI CV Builder. You can chat with me, talk to me via voice, or upload an existing resume (Word, PDF, PPT) to extract data. I will map it to our schema. How can I assist you today?');
    this.fetchTemplates();
    this.initNativeSpeechRecognition();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  onLanguageChange() {
    this.t = UI_TRANSLATIONS[this.language] || UI_TRANSLATIONS['English'];
    this.addMessage('system', `[System: Language changed to ${this.language}]`);
  }

  scrollToBottom(): void {
    try {
      this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    this.messages.push({ role, content });
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;
    
    const msg = this.userInput;
    this.userInput = '';
    this.addMessage('user', msg);
    this.isLoading = true;

    const payload = {
      message: msg,
      history: this.messages.slice(0, -1),
      cv_data: this.cvData,
      language: this.language
    };

    this.http.post<any>(`${this.backendUrl}/chat`, payload).subscribe({
      next: (res) => {
        this.addMessage('assistant', res.reply);
        if (res.cv_data) {
          this.cvData = res.cv_data;
        }
        this.isLoading = false;
        
        if (!this.selectedTemplate && this.templates.length > 0 && this.cvData.summary) {
           this.suggestTemplate();
        }
      },
      error: (err) => {
        console.error(err);
        this.addMessage('system', 'Error communicating with the backend. Is it running?');
        this.isLoading = false;
      }
    });
  }

  suggestTemplate() {
    const queryContext = this.cvData.summary || "professional resume";
    this.http.get<any>(`${this.backendUrl}/templates?query=${encodeURIComponent(queryContext)}`).subscribe(res => {
      const suggested = res.templates && res.templates.length > 0 ? res.templates[0] : this.templates[0];
      if (suggested) {
        this.selectedTemplate = suggested;
        this.addMessage('system', `💡 Suggested template: '${suggested.name}'.`);
      }
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadDocument(file);
    }
  }

  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    this.isLoading = true;
    this.addMessage('system', `Analysing ${file.name} to map to our schema...`);
    
    this.http.post<any>(`${this.backendUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.parsed_cv && Object.keys(res.parsed_cv).length > 0) {
          this.cvData = { ...this.cvData, ...res.parsed_cv };
          if (typeof this.cvData.skills === 'string') {
            this.cvData.skills = this.cvData.skills.split(',').map((s: string) => s.trim());
          }
          this.addMessage('assistant', 'Document processed and mapped! The data is populated. Feel free to use the Edit tab to make adjustments.');
          if (!this.selectedTemplate) this.suggestTemplate();
        } else {
          this.addMessage('assistant', 'Text was captured but schema extraction was imperfect.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.addMessage('system', 'Failed to parse the document.');
        this.isLoading = false;
      }
    });
  }

  initNativeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.nativeSpeechRecognition = new SpeechRecognition();
      this.nativeSpeechRecognition.continuous = false;
      this.nativeSpeechRecognition.interimResults = false;
      
      this.nativeSpeechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput = transcript;
        this.toggleRecording(); 
        this.sendMessage(); 
      };
      this.nativeSpeechRecognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.isRecording = false;
      };
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      if (this.nativeSpeechRecognition) {
        this.nativeSpeechRecognition.stop();
      } else if (this.mediaRecorder) {
        this.mediaRecorder.stop();
      }
    } else {
      this.isRecording = true;
      if (this.nativeSpeechRecognition) {
        this.nativeSpeechRecognition.lang = this.getLanguageCode(this.language);
        this.nativeSpeechRecognition.start();
      } else {
        this.startMediaRecorderFallback();
      }
    }
  }

  getLanguageCode(langName: string): string {
    const map: any = { 'English': 'en-US', 'Spanish': 'es-ES', 'French': 'fr-FR', 'German': 'de-DE', 'Hindi': 'hi-IN', 'Chinese': 'zh-CN' };
    return map[langName] || 'en-US';
  }

  async startMediaRecorderFallback() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.mp3');
        this.isLoading = true;
        this.http.post<any>(`${this.backendUrl}/transcribe`, formData).subscribe(res => {
          this.userInput = res.text;
          this.sendMessage();
        });
        stream.getTracks().forEach(track => track.stop());
      };
      this.mediaRecorder.start();
    } catch (err) {
      console.error('Mic access denied', err);
      this.isRecording = false;
    }
  }

  fetchTemplates() {
    this.http.get<any>(`${this.backendUrl}/templates`).subscribe(res => {
      this.templates = res.templates || [];
    });
  }

  selectTemplate(t: any) {
    this.selectedTemplate = t;
  }

  addExperience() {
    if (!this.cvData.experience) this.cvData.experience = [];
    this.cvData.experience.push({ title: '', company: '', dates: '', description: '' });
  }

  addEducation() {
    if (!this.cvData.education) this.cvData.education = [];
    this.cvData.education.push({ degree: '', institution: '', dates: '' });
  }

  exportPDF() {
    if (!this.selectedTemplate) {
      alert("Please select a template first!");
      return;
    }
    this.activeTab = 'preview';
    setTimeout(() => window.print(), 300);
  }

  exportDocx() {
    if (!this.selectedTemplate) {
      alert("Please select a template first!");
      return;
    }
    const payload = { cv_data: this.cvData, format: 'docx' };
    this.http.post(`${this.backendUrl}/generate`, payload, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }

  exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.cvData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "cv_canonical_schema.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
