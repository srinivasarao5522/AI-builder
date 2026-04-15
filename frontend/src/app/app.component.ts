import { Component, OnInit, ViewChild, ElementRef, HostListener, AfterViewChecked } from '@angular/core';
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
    uploadZone: 'Drag & Drop or Click to Upload (Word, PDF, PPT)',
    typePlaceholder: 'Type a message (e.g. "I am a data analyst at Google")',
    btnSend: '➤',
    tabPreview: 'Live Preview',
    tabEdit: 'Human Review & Edit',
    btnAutoSuggest: '✨ Auto Suggest Template',
    btnUploadLogo: 'Upload Logo',
    noTemplate: 'No Template Selected',
    noTemplateDesc: 'Start chatting to build your profile, drop a document, or click a template above to see the live rendering.',
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
    phSkills: 'JS, SQL, React...',
    btnEnhance: '✨ AI Enhance'
  },
  'Spanish': {
    title: 'Constructor de CV IA',
    exportDocx: 'DOCX',
    exportPdf: 'PDF',
    exportJson: 'JSON',
    chatTitle: 'Asistente Conversacional',
    chatSubtitle: 'Chatea, habla o sube un documento para construir tu currículum.',
    uploadZone: 'Arrastra y suelta o haz clic para subir',
    typePlaceholder: 'Escribe un mensaje...',
    btnSend: '➤',
    tabPreview: 'Vista Previa',
    tabEdit: 'Revisión Humana y Edición',
    btnAutoSuggest: '✨ Sugerir Plantilla',
    btnUploadLogo: 'Subir Logo',
    noTemplate: 'Ninguna plantilla seleccionada',
    formTitle: 'Validar y Editar',
    formDesc: 'Modifica el modelo manualmente aquí.',
    lblFullName: 'Nombre Completo',
    lblEmail: 'Correo',
    lblPhone: 'Teléfono',
    lblSummary: 'Resumen Profesional',
    lblExp: 'Experiencia',
    lblEdu: 'Educación',
    lblSkills: 'Habilidades',
    btnAddRole: '+ Añadir Rol',
    btnAddEdu: '+ Añadir Educación',
    phTitle: 'Cargo',
    phCompany: 'Empresa',
    phDates: 'Fechas',
    phDesc: 'Descripción',
    phDegree: 'Grado',
    phInst: 'Institución',
    phSkills: 'JS, SQL...',
    btnEnhance: '✨ Mejorar con IA'
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
  @ViewChild('logoInput') private logoInput!: ElementRef;

  // View state
  activeTab: 'preview' | 'edit' = 'preview';
  theme: 'dark' | 'light' = 'light';
  isDragging: boolean = false;

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

  // Templates
  templates: any[] = [];
  selectedTemplate: any = null;
  companyLogoUrl: string = 'https://ui-avatars.com/api/?name=Company+Logo&background=0D8ABC&color=fff&size=200';
  
  // Settings & i18n
  language: string = 'English';
  languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese'];
  t: any = UI_TRANSLATIONS['English'];
  
  backendUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.setTheme(this.theme);
    this.addMessage('assistant', 'Welcome! I am your AI CV Builder. You can chat with me, talk to me via voice, or drop an existing resume here. How can I assist you today?');
    this.fetchTemplates();
    this.initNativeSpeechRecognition();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // --- Theme Toggle ---
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(this.theme);
  }

  setTheme(t: 'dark'|'light') {
    document.documentElement.setAttribute('data-theme', t);
  }

  // --- Keyboard & Mic Interruptions ---
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isRecording) {
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
      this.stopRecordingAndSubmit();
    }
  }

  // --- Language ---
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

  // --- Chat ---
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
  
  // --- AI Auto-Completion Enhance ---
  enhanceExperience(exp: any) {
    if (!exp.description || !exp.description.trim()) return;
    exp._isEnhancing = true; // Set loading state for UI
    
    const payload = {
      text: exp.description,
      context: exp.title || '',
      language: this.language
    };
    
    this.http.post<any>(`${this.backendUrl}/enhance`, payload).subscribe({
      next: (res) => {
        exp.description = res.enhanced;
        exp._isEnhancing = false;
      },
      error: () => {
        exp._isEnhancing = false;
      }
    });
  }

  // --- Documents & Logo Uploads ---
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadDocument(file);
    }
  }

  // Drag and Drop Events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.uploadDocument(file);
    }
  }

  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    this.isLoading = true;
    this.addMessage('system', `Analysing ${file.name}...`);
    
    this.http.post<any>(`${this.backendUrl}/upload`, formData).subscribe({
      next: (res) => {
        if (res.parsed_cv && Object.keys(res.parsed_cv).length > 0) {
          this.cvData = { ...this.cvData, ...res.parsed_cv };
          if (typeof this.cvData.skills === 'string') {
            this.cvData.skills = this.cvData.skills.split(',').map((s: string) => s.trim());
          }
          this.addMessage('assistant', 'Document mapped successfully!');
          if (!this.selectedTemplate) this.suggestTemplate();
        } else {
          this.addMessage('assistant', 'Captured text, but schema extraction failed.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  triggerLogoUpload() {
    this.logoInput.nativeElement.click();
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyLogoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // --- Voice / Speech Recognition ---
  initNativeSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.nativeSpeechRecognition = new SpeechRecognition();
      this.nativeSpeechRecognition.continuous = false;
      this.nativeSpeechRecognition.interimResults = true; // Enables live partial transcription!
      
      this.nativeSpeechRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Push intermediate or final text to the input field dynamically
        this.userInput = finalTranscript || interimTranscript;

        if (finalTranscript) {
          this.isRecording = false; 
          this.sendMessage(); // auto submit
        }
      };
      this.nativeSpeechRecognition.onerror = (event: any) => {
        this.isRecording = false;
      };
      this.nativeSpeechRecognition.onend = () => {
        this.isRecording = false;
      }
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopRecordingAndSubmit();
    } else {
      this.userInput = ''; // clear input before taking voice 
      this.isRecording = true;
      if (this.nativeSpeechRecognition) {
        this.nativeSpeechRecognition.lang = this.getLanguageCode(this.language);
        this.nativeSpeechRecognition.start();
      } else {
        this.startMediaRecorderFallback();
      }
    }
  }

  stopRecordingAndSubmit() {
    this.isRecording = false;
    if (this.nativeSpeechRecognition) {
      this.nativeSpeechRecognition.stop(); 
    } else if (this.mediaRecorder) {
      this.mediaRecorder.stop();
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
      this.isRecording = false;
    }
  }

  // --- Various actions ---
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
    if (!this.selectedTemplate) return;
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
    a.download = "cv.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
