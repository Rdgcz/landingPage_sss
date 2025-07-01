# Sítio Sábio Sabiá
Repositório para Homepage do Sítio Sábio Sabiá.
Ver online: www.sitiosabiosabia.com.br
Data de Criação: 02/06/2025
## **Tecnologias Utilizadas**
### **Backend**
- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
- ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
- ![Firebase Admin](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
### **Frontend**
- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) 
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) 
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
### **Infraestrutura**
- ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

-----------------------------------------------------------------------------------------------------------
# 02/06/2025
- Commit Inicial;
- Criação de index.html;
- Criação CNAME;
- Criação .nojekyll;
-----------------------------------------------------------------------------------------------------------
# 08/06/2025
- Criação de cunha.html;

-----------------------------------------------------------------------------------------------------------
# 30/06/2025
- Criação de login.html;
- Criação de restrito.html;

# **Sistema de Área Restrita com Node.js e Firebase**
Este projeto implementa uma **área restrita segura** para armazenamento de documentos pessoais, combinando:
- **Backend Node.js** (processamento seguro)
- **Firebase Admin SDK** (acesso protegido aos serviços)
- **Frontend estático** (interface do usuário)

## **Funcionalidades Principais**

### **Autenticação Segura**
- Login com e-mail/senha via Firebase Authentication
- Controle de acesso por ID de usuário via JWT
- Logout seguro com revogação de token

### **Gerenciamento de Arquivos via API Segura**
- **Upload de arquivos** através de endpoint protegido
- **Organização hierárquica** em subpastas
- Pré-visualização de imagens no cliente
- Barra de progresso para uploads
- Download via links temporários gerados no backend
- Exclusão com confirmação

### **Arquitetura Segura**
- Credenciais do Firebase **totalmente protegidas** no backend
- Validação em duas camadas (frontend + backend)
- Controle de acesso baseado em roles (implementação futura)
- Proteção contra uploads maliciosos

### **Interface Intuitiva**
- Navegação em breadcrumb
- Ícones para tipos de arquivos
- Busca em tempo real
- Design responsivo (mobile/desktop)
- Feedback visual para todas as operações

## **Como Implementamos?**
1. **Configuramos o ambiente seguro**:
   - Firebase Admin SDK com credenciais protegidas
   - Variáveis de ambiente para configurações sensíveis
   - Middlewares de autenticação JWT
2. **Desenvolvemos a API REST**:
   - Endpoints protegidos para todas as operações
   - Validação rigorosa de inputs
   - Tratamento de erros detalhado
3. **Implementamos o frontend**:
   - Chamadas à API com autenticação
   - Feedback visual para o usuário
   - Validações no cliente (camada adicional)
4. **Configuramos regras de segurança**:
   ```javascript
   // Exemplo de regra no backend
   app.post('/api/upload', authenticate, validateFile, async (req, res) => {
     // Verificações adicionais antes do processamento
   });
   ```

## **Próximos Passos**
- [ ] Implementar rate limiting na API
- [ ] Adicionar sistema de logs de operações
- [ ] Criar painel administrativo
- [ ] Implementar backup automático dos arquivos

**Como executar localmente:**

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
python3 -m http.server 3000
```

Feito por RDGCZ + Assistência de IA //
**Nota sobre segurança**: Esta implementação remove todas as credenciais sensíveis do frontend, garantindo que as operações sejam validadas e executadas apenas pelo backend autorizado.
-------------------------------------------------------------------------------------------------------------------------------
