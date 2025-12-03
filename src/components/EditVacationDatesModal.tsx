"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { Vacation, useUpdateVacationDatesMutation } from "@/store/vacationApi";
import toast from "react-hot-toast";

interface EditVacationDatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: Vacation;
}

export default function EditVacationDatesModal({
  isOpen,
  onClose,
  vacation,
}: EditVacationDatesModalProps) {
  const { t } = useTranslation();
  const [updateDates, { isLoading }] = useUpdateVacationDatesMutation();

  const [formData, setFormData] = useState({
    startDate: vacation.startDate.split("T")[0],
    endDate: vacation.endDate.split("T")[0],
    remarks: "",
  });

  useEffect(() => {
    setFormData({
      startDate: vacation.startDate.split("T")[0],
      endDate: vacation.endDate.split("T")[0],
      remarks: "",
    });
  }, [vacation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateDates({
        id: vacation._id,
        ...formData,
      }).unwrap();

      toast.success(
        t("vacation.datesUpdated") || "Vacation dates updated successfully!"
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          t("vacation.updateError") ||
          "Failed to update dates"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("vacation.editDates") || "Edit Vacation Dates"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can adjust the vacation dates if needed.
            The system will recalculate working days automatically.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("vacation.startDate")}
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("vacation.endDate")}
            </label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("vacation.remarks")}{" "}
            <span className="text-gray-500">(Optional)</span>
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) =>
              setFormData({ ...formData, remarks: e.target.value })
            }
            rows={3}
            className="input-field"
            placeholder="Add a note about the date change..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
