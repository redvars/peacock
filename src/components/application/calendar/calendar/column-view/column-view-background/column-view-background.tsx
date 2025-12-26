import { Component, ComponentInterface, h, Host, Prop } from '@stencil/core';
import { addDays, differenceInDays, startOfDay } from 'date-fns';

@Component({
  tag: 'pc-calendar-column-view-background',
  styleUrl: 'column-view-background.scss',
  shadow: true,
})
export class CalendarColumnViewBackground implements ComponentInterface {
  @Prop() dateRange: any;

  @Prop() currentTime: Date;

  #forEachDayInDateRange(callback: Function) {
    for (
      let i = new Date(this.dateRange.startDate);
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1)
    ) {
      callback(i);
    }
  }

  renderBackgroundColumns() {
    const columns = [];
    this.#forEachDayInDateRange((i: Date) => {
      const cls = ['column'];
      const diff = differenceInDays(
        startOfDay(i),
        startOfDay(this.currentTime),
      );
      if (diff === 0) cls.push('today');
      else if (diff < 0) cls.push('past');
      else if (diff < 0) cls.push('future');
      columns.push(<div class={cls.join(' ')}></div>);
    });
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
