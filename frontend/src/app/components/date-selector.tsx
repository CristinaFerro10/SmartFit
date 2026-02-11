import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateSelectorProps {
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
}

export function DateSelector({ onDateSelect, disabled = false }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<DatePicker>(null);

  useEffect(() => {
    // Set today's date as default
    onDateSelect(new Date());
  }, []);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
    setIsOpen(false);
  };

  const handleCalendarClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleCalendarClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
        }`}
        title="Seleziona data"
      >
        <Calendar className="w-5 h-5" />
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop to close date picker when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Date Picker */}
          <div className="absolute right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
            <DatePicker
              ref={datePickerRef}
              selected={selectedDate}
              onChange={handleDateChange}
              inline
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              calendarClassName="custom-datepicker"
            />
          </div>
        </>
      )}
    </div>
  );
}
