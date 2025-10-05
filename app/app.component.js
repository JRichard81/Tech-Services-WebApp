
const { Component } = ng.core;

@Component({
    selector: 'tech-app',
    standalone: true,
    imports: [],
    template: `
        <!-- HEADER: La barra de navegación -->
        <header>
            <nav class="navbar">
                <h1>TECH-SERVICES</h1>
                <ul>
                    <li><a (click)="currentView = 'home'" class="nav-link">INICIO</a></li>
                    <li><a (click)="currentView = 'about'" class="nav-link">MISIÓN Y VISIÓN</a></li>
                    <li><a (click)="currentView = 'services'" class="nav-link">SERVICIOS</a></li>
                    <li><a (click)="currentView = 'login'" class="nav-link">LOGIN</a></li>
                </ul>
            </nav>
        </header>

        <!-- MAIN: El contenido principal que cambia -->
        <main>
            <tech-home *ngIf="currentView === 'home'"></tech-home>
            
            <section *ngIf="currentView === 'about'" class="container">
                <h2>Misión y Visión</h2>
                <p>Esta es la página de Misión y Visión. Próximamente.</p>
            </section>
            
            <section *ngIf="currentView === 'services'" class="container">
                <h2>Nuestros Servicios</h2>
                <p>Esta es la página de Servicios. Próximamente.</p>
            </section>
            
            <section *ngIf="currentView === 'login'" class="container">
                <h2>Login de Administrador</h2>
                <p>Esta es la página de Login. Próximamente.</p>
            </section>
        </main>

        <!-- FOOTER: El pie de página -->
        <footer>
            <p>&copy; 2024 TECH-SERVICES. Todos los derechos reservados.</p>
        </footer>
    `
})
export class TechAppComponent {
    currentView = 'home';
}

window.TechAppComponent = TechAppComponent;