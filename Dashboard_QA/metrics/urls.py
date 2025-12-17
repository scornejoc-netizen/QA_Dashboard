# metrics/urls.py
from django.urls import path
from .views import DeveloperReportView, DeveloperListView, GeneralSummaryView, create_admin_view

urlpatterns = [
    # Ruta para obtener la lista de desarorlladores
    path('developers/', DeveloperListView.as_view(), name='developer-list'),

    # Ruta que el frontend React consumirá: /api/reports/2/ (para el dev ID 2)
    path('reports/<int:dev_id>/', DeveloperReportView.as_view(), name='developer-report'),
    path('summary/', GeneralSummaryView.as_view(), name='general-summary'),
    path('fix-admin/', create_admin_view),
]