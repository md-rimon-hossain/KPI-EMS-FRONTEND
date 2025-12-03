"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import {
  Vacation,
  VacationType,
  useUpdateVacationMutation,
} from "@/store/vacationApi";
import toast from "react-hot-toast";

interface EditVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: Vacation;
}

export default function EditVacationModal({
  isOpen,
  onClose,
  vacation,
}: EditVacationModalProps) {
  const { t } = useTranslation();
  const [updateVacation, { isLoading }] = useUpdateVacationMutation();

  const [formData, setFormData] = useState({
    vacationType: vacation.vacationType,
    startDate: vacation.startDate.split("T")[0],
    endDate: vacation.endDate.split("T")[0],
    reason: vacation.reason,
  });

  useEffect(() => {
    setFormData({
      vacationType: vacation.vacationType,
      startDate: vacation.startDate.split("T")[0],
      endDate: vacation.endDate.split("T")[0],
      reason: vacation.reason,
    });
  }, [vacation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateVacation({
        id: vacation._id,
        ...formData,
      }).unwrap();

      toast.success(
        t("vacation.updateSuccess") || "Vacation updated successfully!"
      );
      onClose();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          t("vacation.updateError") ||
          "Failed to update vacation"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("vacation.editVacation") || "Edit Vacation Request"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("vacation.type")}
          </label>
          <select
            value={formData.vacationType}
            onChange={(e) =>
              setFormData({
                ...formData,
                vacationType: e.target.value as VacationType,
              })
            }
            className="input-field"
            required
          >
            <option value={VacationType.CASUAL}>
              {t("vacation.types.casual")}
            </option>
            <option value={VacationType.SICK}>
              {t("vacation.types.sick")}
            </option>
            <option value={VacationType.ANNUAL}>
              {t("vacation.types.annual")}
            </option>
            <option value={VacationType.MATERNITY}>
              {t("vacation.types.maternity")}
            </option>
            <option value={VacationType.PATERNITY}>
              {t("vacation.types.paternity")}
            </option>
            <option value={VacationType.OTHER}>
              {t("vacation.types.other")}
            </option>
          </select>
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
            {t("vacation.reason")}
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            rows={4}
            className="input-field"
            required
            minLength={10}
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
