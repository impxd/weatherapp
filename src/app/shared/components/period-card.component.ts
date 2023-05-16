import { CommonModule } from '@angular/common'
import {
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core'
import { type Period } from 'src/app/shared/services/weather.service'

@Component({
  standalone: true,
  selector: 'app-period-card',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <p>{{ period.shortName }}</p>
    <img [src]="period.icon" [alt]="period.name + ' weather image'" />
    <h5>{{ period.temperature }}º</h5>
  `,
  styles: [
    `
      app-period-card {
        display: flex;
        flex-direction: column;
        align-items: center;

        > {
          p {
            margin: 0 0 6px;
            text-align: center;
            font-weight: 400;
          }

          img {
            max-width: 55px;
            border-radius: 8px;
          }

          h5 {
            margin: 8px 0 0;
            display: block;
            font-weight: 400;
          }
        }
      }
    `,
  ],
})
export class PeriodCardComponent {
  @Input({ required: true })
  period!: Period
}
