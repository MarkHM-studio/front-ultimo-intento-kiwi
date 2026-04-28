# ⚙️ Guía de instalación detallada

## 🧰 Requisitos

- Java JDK 17  
- Node.js v22  
- PostgreSQL  
- Git  
- ngrok  

---

## 💻 IDEs recomendadas

- Visual Studio Code  
- IntelliJ IDEA  

---

## 🔙 Backend

```bash
git clone <repo-backend>
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Configuración adicional
 - Crear base de datos sistema_lapituca en PostgreSQL
 - Configurar credenciales (JWT, OAuth2, Mercado Pago)
 - Ejecutar script de datos iniciales
 - Exposición con ngrok
    - ngrok config add-authtoken <token>
    - ngrok http 8080

## 🔜 Frontend

```bash
git clone <repo-frontend>
cd frontend
npm install
npm run dev
```

