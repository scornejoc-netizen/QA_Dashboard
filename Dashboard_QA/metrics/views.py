from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count, F, Case, When, ExpressionWrapper, fields
from django.db.models.functions import Coalesce
from datetime import timedelta
from decimal import Decimal

from .models import Developer, Requirement
from .serializers import DeveloperReportSerializer, DeveloperSerializer, RequirementSerializer

class DeveloperListView(generics.ListAPIView):
    """
    GET /api/developers/
    Lista para el selector del Dashboard.
    """
    queryset = Developer.objects.all().order_by('name')
    serializer_class = DeveloperSerializer

class DeveloperReportView(APIView):
    """
    Calcula las métricas usando Python puro para evitar errores de ORM con SQLite.
    """
    def get(self, request, dev_id, format=None):
        try:
            developer = Developer.objects.get(pk=dev_id)
        except Developer.DoesNotExist:
            return Response({"detail": "Dev no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Obtener requerimientos y filtrar por fecha si es necesario
        requirements_qs = Requirement.objects.filter(developer=developer)
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            requirements_qs = requirements_qs.filter(date_completed__gte=start_date)
        if end_date:
            requirements_qs = requirements_qs.filter(date_completed__lte=end_date)

        # 2. Inicializar contadores
        total_reqs = 0
        unit_total = 0
        unit_passed = 0
        bugs_qa = 0
        bugs_prod = 0
        rechazos = 0
        hours_est = Decimal(0.0)
        hours_real = Decimal(0.0)

        serialized_reqs = []

        # 3. Iterar y sumar (Cálculo en Python = No Error 500)
        for req in requirements_qs:
            total_reqs += 1
            unit_total += req.unit_tests_total
            unit_passed += req.unit_tests_passed
            
            # Sumar bugs de este ticket
            bugs_qa += (req.functional_bugs + req.integration_bugs + req.regression_bugs)
            bugs_prod += req.production_bugs
            rechazos += req.rejection_count
            
            hours_est += req.estimated_effort_hours
            # Usamos la propiedad del modelo que ya tiene la lógica de 9 horas
            hours_real += Decimal(req.real_effort_hours) 

            # Preparamos la data para la lista desplegable del frontend
            serialized_reqs.append(RequirementSerializer(req).data)

        # 4. Cálculos finales
        unit_failed = unit_total - unit_passed
        
        # DDE (Eficacia QA)
        total_issues = bugs_qa + bugs_prod
        dde_score = 0
        if total_issues > 0:
            dde_score = round((bugs_qa / total_issues) * 100, 1)
        elif total_reqs > 0:
            dde_score = 100 # Si no hubo bugs, eficacia perfecta

        # Eficiencia de Tiempo
        diff_hours = hours_est - hours_real
        tiempo_eficiencia_pct = 0
        if hours_est > 0:
            tiempo_eficiencia_pct = round((diff_hours / hours_est) * 100, 1)

        data = {
            "developer_id": developer.id,
            "total_requerimientos": total_reqs,
            "unitarias_total": unit_total,
            "unitarias_pasadas": unit_passed,
            "unitarias_fallidas": unit_failed,
            "total_bugs_qa": bugs_qa,
            "total_bugs_prod": bugs_prod,
            "total_rechazos": rechazos,
            "dde_score": dde_score,
            "total_estimated_hours": hours_est,
            "total_real_hours": hours_real,
            "tiempo_desvio_total": diff_hours,
            "tiempo_eficiencia_pct": tiempo_eficiencia_pct,
            "requerimientos_lista": serialized_reqs 
        }

        return Response(data, status=status.HTTP_200_OK)



class GeneralSummaryView(APIView):
    """
    Genera la matriz de resumen de calidad para todos los desarrolladores.
    """
    def get(self, request, format=None):
        developers = Developer.objects.all()
        summary_data = []

        for dev in developers:
            reqs = Requirement.objects.filter(developer=dev)
            
            # --- NUEVO: Contamos cuántos requerimientos tiene este Dev ---
            req_count = reqs.count() 
            # -------------------------------------------------------------

            # Inicializamos contadores
            stats = {
                'functional': {'total': 0, 'bugs': 0},
                'integration': {'total': 0, 'bugs': 0},
                'regression': {'total': 0, 'bugs': 0},
                'unit': {'total': 0, 'bugs': 0}
            }

            for req in reqs:
                stats['functional']['total'] += (req.functional_cases or 0)
                stats['functional']['bugs'] += (req.functional_bugs or 0)
                
                stats['integration']['total'] += (req.integration_cases or 0)
                stats['integration']['bugs'] += (req.integration_bugs or 0)

                stats['regression']['total'] += (req.regression_cases or 0)
                stats['regression']['bugs'] += (req.regression_bugs or 0)

                stats['unit']['total'] += (req.unit_tests_total or 0)
                stats['unit']['bugs'] += (req.unit_tests_failed or 0)

            def calc_success(total, bugs):
                if total == 0: return 0
                success_count = total - bugs
                return round((success_count / total) * 100, 1)

            dev_summary = {
                'id': dev.id,
                'name': dev.name,
                'total_reqs': req_count,
                
                'functional_total': stats['functional']['total'],
                'functional_bugs': stats['functional']['bugs'],
                'functional_pct': calc_success(stats['functional']['total'], stats['functional']['bugs']),
                
                'integration_total': stats['integration']['total'],
                'integration_bugs': stats['integration']['bugs'],
                'integration_pct': calc_success(stats['integration']['total'], stats['integration']['bugs']),

                'regression_total': stats['regression']['total'],
                'regression_bugs': stats['regression']['bugs'],
                'regression_pct': calc_success(stats['regression']['total'], stats['regression']['bugs']),

                'unit_total': stats['unit']['total'],
                'unit_bugs': stats['unit']['bugs'],
                'unit_pct': calc_success(stats['unit']['total'], stats['unit']['bugs']),
            }
            summary_data.append(dev_summary)

        return Response(summary_data, status=status.HTTP_200_OK)


from django.http import HttpResponse
from django.contrib.auth import get_user_model

def create_admin_view(request):
    User = get_user_model()
    username = "admin"  # Pon aquí el usuario que quieras
    email = "admin@test.com"
    password = "AdminPassword123!" # Pon aquí la contraseña

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        return HttpResponse(f"✅ Usuario '{username}' creado. ¡Intenta loguearte!")
    else:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        return HttpResponse(f"🔄 Usuario '{username}' ya existía. Contraseña restablecida.")