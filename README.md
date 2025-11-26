# ⚔️ Albion Loot Tracker - Activities Manager

![Albion Online](https://assets.albiononline.com/uploads/media/default/media/d51bd4ee4b6540491eaf0e41e90dc1951888453d.jpeg)

> **El sistema definitivo para gestionar actividades PvP y repartir loot de forma justa y automática en Albion Online.**

## 🚀 ¿Qué es Albion Loot Tracker?

Este proyecto es una herramienta diseñada para **automatizar y simplificar** la gestión de actividades de gremio en Albion Online. Utilizando la API pública de Albion, el sistema rastrea en tiempo real las kills, muertes y asistencias de tu party, calculando automáticamente el loot obtenido y generando estadísticas precisas para un reparto justo (Split).

### 💡 ¿Por qué usar esto en lugar de un Excel manual?

Si alguna vez has liderado una actividad de gankeo o ZvZ, conoces el dolor de cabeza:
*   ❌ **Error Humano:** Olvidar anotar una kill o un item valioso.
*   ❌ **Pérdida de Tiempo:** Pasarse 30 minutos después de la actividad sumando valores en una hoja de cálculo.
*   ❌ **Desconfianza:** Miembros que sienten que el split no fue transparente.
*   ❌ **Caos:** No saber quién estaba AFK, quién se fue antes o quién llegó tarde.

**Albion Loot Tracker soluciona todo esto:**
*   ✅ **Automático:** Detecta las kills al instante.
*   ✅ **Transparente:** Muestra exactamente qué items cayeron y quién participó.
*   ✅ **Justo:** Calcula porcentajes de participación basados en el tiempo activo de cada miembro.
*   ✅ **Histórico:** Guarda un registro de todas tus actividades pasadas.

---

## ✨ Características Principales

*   **Rastreo en Tiempo Real:** Monitoreo constante de eventos de kill de tu gremio.
*   **Gestión de Participantes:**
    *   Agregar/Eliminar miembros de la actividad.
    *   Sistema de **Pausa/Reanudar** para miembros que se ausentan momentáneamente.
    *   Cálculo automático de tiempo de actividad.
*   **Detección de Loot:**
    *   Visualización de inventario de la víctima.
    *   Distinción entre loot confirmado (obtenido) y items destruidos (trash).
    *   Estimación de valor (basado en tier/calidad).
*   **Monitor de "Otras Kills":** Una pantalla secundaria para ver qué están matando los miembros del gremio que *no* están en tu actividad actual (ideal para líderes de gremio).
*   **Interfaz Moderna:** Diseño oscuro (Dark Mode), responsive y fácil de usar.
*   **Reloj UTC:** Sincronización perfecta con el tiempo del servidor.

---

## 🛠️ Instalación y Uso

Este proyecto es una aplicación web que puede correr en cualquier servidor local o web hosting.

### Requisitos
*   Un servidor web (Apache, Nginx, o simplemente XAMPP/WAMP en Windows).
*   Navegador web moderno.

### Pasos
1.  Clona este repositorio:
    ```bash
    git clone https://github.com/BenjaAldaya/loot-tracker-activities.git
    ```
2.  Coloca los archivos en la carpeta pública de tu servidor (ej. `htdocs` en XAMPP).
3.  Abre `index.html` en tu navegador (ej. `http://localhost/loot-tracker-activities`).
4.  Ve a **Configuración**, busca tu gremio y ¡listo!

---

## 🤝 Contribuciones (Open Source)

¡Este proyecto es de **Código Abierto** y queremos que la comunidad de desarrolladores de Albion ayude a mejorarlo!

**¿Eres programador?**
Si tienes ideas para mejorar el código, optimizar la API, o agregar nuevas funciones (como integración con Discord, precios de mercado en tiempo real, etc.), ¡tu ayuda es bienvenida!

### ¿Cómo contribuir?
1.  Haz un **Fork** de este repositorio.
2.  Crea una rama con tu nueva funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Haz tus cambios y commitea (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un **Pull Request** en este repositorio original.

> **Nota Importante:** Este es el repositorio oficial. Si quieres que tus mejoras sean usadas por la comunidad, por favor envíalas aquí mediante Pull Request en lugar de crear repositorios separados. ¡Hagamos crecer esta herramienta juntos!

---

## 📞 Contacto y Soporte

Este proyecto es mantenido por **BenjaAldaya**.

Si tienes sugerencias, encuentras un bug, o simplemente quieres agradecer:
*   **GitHub Issues:** Abre un issue en este repositorio para reportar errores.
*   **Discord:** .sharkl

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - eres libre de usarlo y modificarlo, pero se agradece mantener la atribución al autor original (**BenjaAldaya**).

---
*Hecho con ❤️ para la comunidad de Albion Online.*
