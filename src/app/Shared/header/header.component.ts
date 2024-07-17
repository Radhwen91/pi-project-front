import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { TokenRefreshRequest } from 'app/Models/dto/TokenRefreshRequest';
import { User } from 'app/Models/user';
import { AuthenticationService } from 'app/Services/authentication.service';
import { NotificationService } from 'app/Services/notification.service';
import { NotificationType } from 'app/enum/notification-type.enum';
import { Role } from 'app/enum/role.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  public user: User = new User;
  tokenRefresh: TokenRefreshRequest = { refreshToken: '' };

  constructor(private router: Router, private authenticationService: AuthenticationService,
   private notificationService: NotificationService) {}

   ngOnInit(): void {
    const user = this.authenticationService.getUserFromLocalCache();
    if (user !== null) {
      this.user = user;
    }
  }

  @HostListener('window:scroll', ['$event'])

onWindowScroll() {
    let element = document.querySelector('.navbar') as HTMLElement;
    if (window.pageYOffset > element.clientHeight) {
      element.classList.add('navbar-inverse');
    } else {
      element.classList.remove('navbar-inverse');
    }
  }

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    const user = this.authenticationService.getUserFromLocalCache();
    if (user !== null) {
      return user.role;
    }
    return '';
      }


      public onLogOut(): void {
        const user = this.authenticationService.getUserFromLocalCache();
        if (user) {
          this.tokenRefresh.refreshToken = user.refreshToken;
          this.authenticationService.logOutFromDB(this.tokenRefresh).subscribe(res => {
            this.authenticationService.logOut();
            this.router.navigate(['/login']);
            this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
          });
        } else {
          // Handle the case where there is no user in local cache
          this.router.navigate(['/login']);
          this.sendNotification(NotificationType.WARNING, `No user logged in`);
        }
      }

  isLoggedIn(): boolean {
    return this.authenticationService.isUserLoggedIn();
  }

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }
}
