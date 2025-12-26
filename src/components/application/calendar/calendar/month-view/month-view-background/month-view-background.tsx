import { Component, ComponentInterface, h, Host, Prop } from '@stencil/core';
import { isEqual, startOfDay } from 'date-fns';

@Component({
  tag: 'pc-calendar-month-view-background',
  styleUrl: 'month-view-background.scss',
  shadow: true,
})
export class CalendarMonthViewBackground implements ComponentInterface {
  @Prop() columns: number = 1;

  renderBackgroundColumns() {
    const columns = [];
    for (let i = 0; i < this.columns; i++) {
      const cls = ['column'];
      if (isEqual(startOfDay(i), startOfDay(new Date()))) cls.push('active');
      columns.push(<div class={cls.join(' ')}></div>);
    }
    return columns;
  }

  render() {
    const rows = [];
    for (let i = 0; i < 48; i++) {
      // @TODO: parameterize number of column, currently rendering 24 hours
      const cls = ['row'];
      if (i % 2) cls.push('hour');
      const row = (
        <div class={cls.join(' ')}>{this.renderBackgroundColumns()}</div>
      );
      rows.push(row);
    }
    return (
      <Host>
        <div class="background">{rows}</div>
      </Host>
    );
  }
}
