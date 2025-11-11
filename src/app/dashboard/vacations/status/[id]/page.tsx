"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetVacationByIdQuery } from "@/store/vacationApi";
import VacationStatusTracker from "@/components/VacationStatusTracker";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VacationStatusPage() {
  const params = useParams();
  const router = useRouter();
  const vacationId = params.id as string;

  const { data, isLoading, error } = useGetVacationByIdQuery(vacationId);

  const handleDownloadPDF = async () => {
    try {
      toast.success("Generating PDF...");

      // TODO: Implement actual PDF generation
      // For now, we'll create a simple download
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vacations/${vacationId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vacation-approval-${vacationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF. Feature coming soon!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vacation Request Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The vacation request you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/dashboard/vacations/my-vacations")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Vacations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vacation = data.data.vacation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Status Tracker */}
        <VacationStatusTracker
          vacation={vacation}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* Additional Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push("/dashboard/vacations/my-vacations")}
            className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm"
          >
            View All My Requests
          </button>
          <button
            onClick={() => router.push("/dashboard/vacations/apply")}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            Submit New Request
          </button>
        </div>
      </div>
    </div>
  );
}
