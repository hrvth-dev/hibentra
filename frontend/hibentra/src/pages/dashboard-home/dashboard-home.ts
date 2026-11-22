
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

interface Ticket {
    id: number;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
    room?: {
        building: string;
        roomNumber: string;
    };
    category?: {
        name: string;
    };
}

interface TicketResponse {
    data: {
        tickets: Ticket[];
        total: number;
    };
}

interface RoomResponse {
    data: {
        rooms: unknown[];
        total: number;
    };
}

interface CategoryResponse {
    data: {
        categories: unknown[];
        total: number;
    };
}

@Component({
    selector: 'app-dashboard-home',
    standalone: true,
    imports: [DatePipe, RouterLink],
    templateUrl: './dashboard-home.html',
    styleUrl: './dashboard-home.css'
})
export class DashboardHome implements OnInit {
    private readonly http = inject(HttpClient);
    readonly auth = inject(AuthService);

    readonly loading = signal(true);
    readonly error = signal('');

    readonly tickets = signal<Ticket[]>([]);
    readonly ticketCount = signal(0);
    readonly roomCount = signal(0);
    readonly categoryCount = signal(0);

    readonly inProgressCount = computed(() =>
        this.tickets().filter(
            ticket => ticket.status === 'IN_PROGRESS'
        ).length
    );

    readonly recentTickets = computed(() =>
        this.tickets().slice(0, 5)
    );

    ngOnInit(): void {
        this.loadDashboard();
    }

    loadDashboard(): void {
        this.loading.set(true);
        this.error.set('');

        forkJoin({
            tickets: this.http.get<TicketResponse>('/api/ticket'),
            rooms: this.http.get<RoomResponse>('/api/rooms'),
            categories: this.http.get<CategoryResponse>('/api/category')
        })
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: ({ tickets, rooms, categories }) => {
                    this.tickets.set(tickets.data.tickets);
                    this.ticketCount.set(tickets.data.total);
                    this.roomCount.set(rooms.data.total);
                    this.categoryCount.set(categories.data.total);
                },
                error: () => {
                    this.error.set(
                        'Nem sikerült betölteni az adatokat. Ellenőrizd a backend működését.'
                    );
                }
            });
    }

    statusLabel(status: string): string {
        const labels: Record<string, string> = {
            NEW: 'Új',
            ASSIGNED: 'Kiosztva',
            IN_PROGRESS: 'Folyamatban',
            RESOLVED: 'Megoldva',
            CLOSED: 'Lezárva'
        };

        return labels[status] ?? status;
    }
}
