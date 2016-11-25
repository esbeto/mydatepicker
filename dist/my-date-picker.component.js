"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var my_date_picker_locale_service_1 = require("./services/my-date-picker.locale.service");
var my_date_picker_validator_service_1 = require("./services/my-date-picker.validator.service");
var MyDatePicker = (function () {
    function MyDatePicker(elem, renderer, localeService, validatorService) {
        var _this = this;
        this.elem = elem;
        this.renderer = renderer;
        this.localeService = localeService;
        this.validatorService = validatorService;
        this.dateChanged = new core_1.EventEmitter();
        this.inputFieldChanged = new core_1.EventEmitter();
        this.calendarViewChanged = new core_1.EventEmitter();
        this.showSelector = false;
        this.visibleMonth = { monthTxt: "", monthNbr: 0, year: 0 };
        this.selectedMonth = { monthTxt: "", monthNbr: 0, year: 0 };
        this.selectedDate = { year: 0, month: 0, day: 0 };
        this.weekDays = [];
        this.dates = [];
        this.selectionDayTxt = "";
        this.invalidDate = false;
        this.dayIdx = 0;
        this.today = null;
        this.weekDayOpts = ["su", "mo", "tu", "we", "th", "fr", "sa"];
        this.editMonth = false;
        this.invalidMonth = false;
        this.editYear = false;
        this.invalidYear = false;
        this.PREV_MONTH = 1;
        this.CURR_MONTH = 2;
        this.NEXT_MONTH = 3;
        this.opts = {
            dayLabels: {},
            monthLabels: {},
            dateFormat: "",
            todayBtnTxt: "",
            firstDayOfWeek: "",
            sunHighlight: true,
            markCurrentDay: true,
            disableUntil: { year: 0, month: 0, day: 0 },
            disableSince: { year: 0, month: 0, day: 0 },
            disableDays: [],
            disableWeekends: false,
            height: "34px",
            width: "100%",
            selectionTxtFontSize: "18px",
            inline: false,
            alignSelectorRight: false,
            indicateInvalidDate: true,
            showDateFormatPlaceholder: false,
            editableMonthAndYear: true,
            minYear: 1000,
            maxYear: 9999,
            componentDisabled: false
        };
        this.setLocaleOptions();
        this.today = new Date();
        renderer.listenGlobal("document", "click", function (event) {
            if (_this.showSelector && event.target && _this.elem.nativeElement !== event.target && !_this.elem.nativeElement.contains(event.target)) {
                _this.showSelector = false;
            }
            if (_this.opts.editableMonthAndYear && event.target && _this.elem.nativeElement.contains(event.target)) {
                _this.resetMonthYearEdit();
            }
        });
    }
    MyDatePicker.prototype.setLocaleOptions = function () {
        var _this = this;
        var opts = this.localeService.getLocaleOptions(this.locale);
        Object.keys(opts).forEach(function (k) {
            _this.opts[k] = opts[k];
        });
    };
    MyDatePicker.prototype.setOptions = function () {
        var _this = this;
        if (this.options !== undefined) {
            Object.keys(this.options).forEach(function (k) {
                _this.opts[k] = _this.options[k];
            });
        }
        if (this.opts.minYear < 1000) {
            this.opts.minYear = 1000;
        }
        if (this.opts.maxYear > 9999) {
            this.opts.minYear = 9999;
        }
    };
    MyDatePicker.prototype.resetMonthYearEdit = function () {
        this.editMonth = false;
        this.editYear = false;
        this.invalidMonth = false;
        this.invalidYear = false;
    };
    MyDatePicker.prototype.editMonthClicked = function (event) {
        event.stopPropagation();
        if (this.opts.editableMonthAndYear) {
            this.editMonth = true;
        }
    };
    MyDatePicker.prototype.editYearClicked = function (event) {
        event.stopPropagation();
        if (this.opts.editableMonthAndYear) {
            this.editYear = true;
        }
    };
    MyDatePicker.prototype.userDateInput = function (event) {
        this.invalidDate = false;
        if (event.target.value.length === 0) {
            this.removeBtnClicked();
        }
        else {
            var date = this.validatorService.isDateValid(event.target.value, this.opts.dateFormat, this.opts.minYear, this.opts.maxYear, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDays, this.opts.monthLabels);
            if (date.day !== 0 && date.month !== 0 && date.year !== 0) {
                this.selectDate({ day: date.day, month: date.month, year: date.year });
            }
            else {
                this.invalidDate = true;
            }
        }
        if (this.invalidDate) {
            this.inputFieldChanged.emit({ value: event.target.value, dateFormat: this.opts.dateFormat, valid: !(event.target.value.length === 0 || this.invalidDate) });
        }
    };
    MyDatePicker.prototype.userMonthInput = function (event) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            return;
        }
        this.invalidMonth = false;
        var m = this.validatorService.isMonthLabelValid(event.target.value, this.opts.monthLabels);
        if (m !== -1) {
            this.editMonth = false;
            this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: this.visibleMonth.year };
            this.generateCalendar(m, this.visibleMonth.year);
        }
        else {
            this.invalidMonth = true;
        }
    };
    MyDatePicker.prototype.userYearInput = function (event) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            return;
        }
        this.invalidYear = false;
        var y = this.validatorService.isYearLabelValid(Number(event.target.value), this.opts.minYear, this.opts.maxYear);
        if (y !== -1) {
            this.editYear = false;
            this.visibleMonth = { monthTxt: this.visibleMonth.monthTxt, monthNbr: this.visibleMonth.monthNbr, year: y };
            this.generateCalendar(this.visibleMonth.monthNbr, y);
        }
        else {
            this.invalidYear = true;
        }
    };
    MyDatePicker.prototype.parseOptions = function () {
        this.setOptions();
        if (this.locale) {
            this.setLocaleOptions();
        }
        this.dayIdx = this.weekDayOpts.indexOf(this.opts.firstDayOfWeek);
        if (this.dayIdx !== -1) {
            var idx = this.dayIdx;
            for (var i = 0; i < this.weekDayOpts.length; i++) {
                this.weekDays.push(this.opts.dayLabels[this.weekDayOpts[idx]]);
                idx = this.weekDayOpts[idx] === "sa" ? 0 : idx + 1;
            }
        }
        if (this.opts.inline) {
            this.openBtnClicked();
        }
    };
    MyDatePicker.prototype.ngOnChanges = function (changes) {
        if (changes.hasOwnProperty("locale")) {
            this.locale = changes["locale"].currentValue;
        }
        if (changes.hasOwnProperty("options")) {
            this.options = changes["options"].currentValue;
        }
        this.weekDays.length = 0;
        this.parseOptions();
        if (changes.hasOwnProperty("defaultMonth")) {
            this.selectedMonth = this.parseSelectedMonth((changes["defaultMonth"].currentValue).toString());
        }
        if (changes.hasOwnProperty("selDate")) {
            this.selectionDayTxt = changes["selDate"].currentValue;
            if (this.selectionDayTxt !== "") {
                this.selectedDate = this.parseSelectedDate(this.selectionDayTxt);
            }
            else {
                this.removeBtnClicked();
            }
        }
    };
    MyDatePicker.prototype.removeBtnClicked = function () {
        this.selectionDayTxt = "";
        this.selectedDate = { year: 0, month: 0, day: 0 };
        this.dateChanged.emit({ date: {}, formatted: this.selectionDayTxt, epoc: 0 });
        this.inputFieldChanged.emit({ value: "", dateFormat: this.opts.dateFormat, valid: false });
        this.invalidDate = false;
    };
    MyDatePicker.prototype.openBtnClicked = function () {
        this.showSelector = !this.showSelector;
        if (this.showSelector || this.opts.inline) {
            var y = 0, m = 0;
            if (this.selectedDate.year === 0 && this.selectedDate.month === 0 && this.selectedDate.day === 0) {
                if (this.selectedMonth.year === 0 && this.selectedMonth.monthNbr === 0) {
                    y = this.today.getFullYear();
                    m = this.today.getMonth() + 1;
                }
                else {
                    y = this.selectedMonth.year;
                    m = this.selectedMonth.monthNbr;
                }
            }
            else {
                y = this.selectedDate.year;
                m = this.selectedDate.month;
            }
            this.visibleMonth = { monthTxt: this.opts.monthLabels[m], monthNbr: m, year: y };
            this.generateCalendar(m, y);
        }
    };
    MyDatePicker.prototype.prevMonth = function () {
        var d = this.getDate(this.visibleMonth.year, this.visibleMonth.monthNbr, 1);
        d.setMonth(d.getMonth() - 1);
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: y };
        this.generateCalendar(m, y);
    };
    MyDatePicker.prototype.nextMonth = function () {
        var d = this.getDate(this.visibleMonth.year, this.visibleMonth.monthNbr, 1);
        d.setMonth(d.getMonth() + 1);
        var y = d.getFullYear();
        var m = d.getMonth() + 1;
        this.visibleMonth = { monthTxt: this.monthText(m), monthNbr: m, year: y };
        this.generateCalendar(m, y);
    };
    MyDatePicker.prototype.prevYear = function () {
        if (this.visibleMonth.year - 1 < this.opts.minYear) {
            return;
        }
        this.visibleMonth.year--;
        this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
    };
    MyDatePicker.prototype.nextYear = function () {
        if (this.visibleMonth.year + 1 > this.opts.maxYear) {
            return;
        }
        this.visibleMonth.year++;
        this.generateCalendar(this.visibleMonth.monthNbr, this.visibleMonth.year);
    };
    MyDatePicker.prototype.todayClicked = function () {
        var m = this.today.getMonth() + 1;
        var y = this.today.getFullYear();
        this.selectDate({ day: this.today.getDate(), month: m, year: y });
        if (this.opts.inline) {
            this.visibleMonth = { monthTxt: this.opts.monthLabels[m], monthNbr: m, year: y };
            this.generateCalendar(m, y);
        }
    };
    MyDatePicker.prototype.cellClicked = function (cell) {
        if (cell.cmo === this.PREV_MONTH) {
            this.prevMonth();
        }
        else if (cell.cmo === this.CURR_MONTH) {
            this.selectDate(cell.dateObj);
        }
        else if (cell.cmo === this.NEXT_MONTH) {
            this.nextMonth();
        }
        this.resetMonthYearEdit();
    };
    MyDatePicker.prototype.selectDate = function (date) {
        this.selectedDate = { day: date.day, month: date.month, year: date.year };
        this.selectionDayTxt = this.formatDate(this.selectedDate);
        this.showSelector = false;
        this.dateChanged.emit({
            date: this.selectedDate,
            formatted: this.selectionDayTxt,
            epoc: Math.round(this.getTimeInMilliseconds(this.selectedDate) / 1000.0)
        });
        this.inputFieldChanged.emit({ value: this.selectionDayTxt, dateFormat: this.opts.dateFormat, valid: true });
        this.invalidDate = false;
    };
    MyDatePicker.prototype.preZero = function (val) {
        return parseInt(val) < 10 ? "0" + val : val;
    };
    MyDatePicker.prototype.formatDate = function (val) {
        var formatted = this.opts.dateFormat.replace("yyyy", val.year).replace("dd", this.preZero(val.day));
        return this.opts.dateFormat.indexOf("mmm") !== -1 ? formatted.replace("mmm", this.monthText(val.month)) : formatted.replace("mm", this.preZero(val.month));
    };
    MyDatePicker.prototype.monthText = function (m) {
        return this.opts.monthLabels[m];
    };
    MyDatePicker.prototype.monthStartIdx = function (y, m) {
        var d = new Date();
        d.setDate(1);
        d.setMonth(m - 1);
        d.setFullYear(y);
        var idx = d.getDay() + this.sundayIdx();
        return idx >= 7 ? idx - 7 : idx;
    };
    MyDatePicker.prototype.daysInMonth = function (m, y) {
        return new Date(y, m, 0).getDate();
    };
    MyDatePicker.prototype.daysInPrevMonth = function (m, y) {
        var d = this.getDate(y, m, 1);
        d.setMonth(d.getMonth() - 1);
        return this.daysInMonth(d.getMonth() + 1, d.getFullYear());
    };
    MyDatePicker.prototype.isCurrDay = function (d, m, y, cmo) {
        return d === this.today.getDate() && m === this.today.getMonth() + 1 && y === this.today.getFullYear() && cmo === 2;
    };
    MyDatePicker.prototype.getTimeInMilliseconds = function (date) {
        return this.getDate(date.year, date.month, date.day).getTime();
    };
    MyDatePicker.prototype.getDayNumber = function (date) {
        var d = this.getDate(date.year, date.month, date.day);
        return d.getDay();
    };
    MyDatePicker.prototype.getWeekday = function (date) {
        return this.weekDayOpts[this.getDayNumber(date)];
    };
    MyDatePicker.prototype.getDate = function (year, month, day) {
        return new Date(year, month - 1, day, 0, 0, 0, 0);
    };
    MyDatePicker.prototype.sundayIdx = function () {
        return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
    };
    MyDatePicker.prototype.generateCalendar = function (m, y) {
        this.dates.length = 0;
        var monthStart = this.monthStartIdx(y, m);
        var dInThisM = this.daysInMonth(m, y);
        var dInPrevM = this.daysInPrevMonth(m, y);
        var dayNbr = 1;
        var cmo = this.PREV_MONTH;
        for (var i = 1; i < 7; i++) {
            var week = [];
            if (i === 1) {
                var pm = dInPrevM - monthStart + 1;
                for (var j = pm; j <= dInPrevM; j++) {
                    var date = { year: y, month: m - 1, day: j };
                    week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(j, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.validatorService.isDisabledDay(date, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDays) });
                }
                cmo = this.CURR_MONTH;
                var daysLeft = 7 - week.length;
                for (var j = 0; j < daysLeft; j++) {
                    var date = { year: y, month: m, day: dayNbr };
                    week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(dayNbr, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.validatorService.isDisabledDay(date, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDays) });
                    dayNbr++;
                }
            }
            else {
                for (var j = 1; j < 8; j++) {
                    if (dayNbr > dInThisM) {
                        dayNbr = 1;
                        cmo = this.NEXT_MONTH;
                    }
                    var date = { year: y, month: cmo === this.CURR_MONTH ? m : m + 1, day: dayNbr };
                    week.push({ dateObj: date, cmo: cmo, currDay: this.isCurrDay(dayNbr, m, y, cmo), dayNbr: this.getDayNumber(date), disabled: this.validatorService.isDisabledDay(date, this.opts.disableUntil, this.opts.disableSince, this.opts.disableWeekends, this.opts.disableDays) });
                    dayNbr++;
                }
            }
            this.dates.push(week);
        }
        this.calendarViewChanged.emit({ year: y, month: m, first: { number: 1, weekday: this.getWeekday({ year: y, month: m, day: 1 }) }, last: { number: dInThisM, weekday: this.getWeekday({ year: y, month: m, day: dInThisM }) } });
    };
    MyDatePicker.prototype.parseSelectedDate = function (ds) {
        var date = { day: 0, month: 0, year: 0 };
        if (ds !== "") {
            date.day = this.validatorService.parseDatePartNumber(this.opts.dateFormat, ds, "dd");
            date.month = this.opts.dateFormat.indexOf("mmm") !== -1
                ? this.validatorService.parseDatePartMonthName(this.opts.dateFormat, ds, "mmm", this.opts.monthLabels)
                : this.validatorService.parseDatePartNumber(this.opts.dateFormat, ds, "mm");
            date.year = this.validatorService.parseDatePartNumber(this.opts.dateFormat, ds, "yyyy");
        }
        return date;
    };
    MyDatePicker.prototype.parseSelectedMonth = function (ms) {
        return this.validatorService.parseDefaultMonth(ms);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], MyDatePicker.prototype, "options", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], MyDatePicker.prototype, "locale", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], MyDatePicker.prototype, "defaultMonth", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], MyDatePicker.prototype, "selDate", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], MyDatePicker.prototype, "dateChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], MyDatePicker.prototype, "inputFieldChanged", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], MyDatePicker.prototype, "calendarViewChanged", void 0);
    MyDatePicker = __decorate([
        core_1.Component({
            selector: "my-date-picker",
            styleUrls: ["./my-date-picker.component.css"],
            templateUrl: "./my-date-picker.component.html",
            providers: [my_date_picker_locale_service_1.LocaleService, my_date_picker_validator_service_1.ValidatorService],
            encapsulation: core_1.ViewEncapsulation.None
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.Renderer, my_date_picker_locale_service_1.LocaleService, my_date_picker_validator_service_1.ValidatorService])
    ], MyDatePicker);
    return MyDatePicker;
}());
exports.MyDatePicker = MyDatePicker;

//# sourceMappingURL=my-date-picker.component.js.map
