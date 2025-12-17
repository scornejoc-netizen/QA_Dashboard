from rest_framework import serializers
from .models import Developer, Requirement

class DeveloperSerializer(serializers.ModelSerializer):
    """Información básica para listas desplegables."""
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    
    class Meta:
        model = Developer
        fields = ('id', 'name', 'rol', 'rol_display', 'email')

class RequirementSerializer(serializers.ModelSerializer):
    unit_test_success_rate = serializers.ReadOnlyField()
    real_effort_days = serializers.ReadOnlyField()
    real_effort_hours = serializers.ReadOnlyField()
    deviation_hours = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Requirement
        fields = (
            'id', 'jira_ticket', 'description', 'date_completed',
            'unit_tests_total', 'unit_tests_passed', 'unit_tests_failed', 'unit_test_success_rate',
            # AGREGAMOS LOS CASOS AQUÍ:
            'functional_cases', 'functional_bugs', 
            'integration_cases', 'integration_bugs', 
            'regression_cases', 'regression_bugs', 
            'production_bugs', 
            'rejection_count',
            'estimated_effort_hours', 'real_effort_days', 'real_effort_hours', 'deviation_hours',
            'is_qa_approved', 'status_display'
        )

    def get_deviation_hours(self, obj):
        return obj.estimated_effort_hours - obj.real_effort_hours

    def get_status_display(self, obj):
        return "APROBADO" if obj.is_qa_approved else "REVISIÓN"

class DeveloperReportSerializer(serializers.Serializer):
    """
    Este serializer no se guarda en BD, solo estructura la respuesta JSON
    para el reporte consolidado.
    """
    developer_id = serializers.IntegerField()
    total_requerimientos = serializers.IntegerField()
    
    # Métricas de Calidad
    unitarias_total = serializers.IntegerField()
    unitarias_pasadas = serializers.IntegerField()
    unitarias_fallidas = serializers.IntegerField()
    
    total_bugs_qa = serializers.IntegerField()
    total_bugs_prod = serializers.IntegerField()
    total_rechazos = serializers.IntegerField()
    
    dde_score = serializers.FloatField()

    # Métricas de Tiempo
    total_estimated_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_real_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    tiempo_desvio_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    tiempo_eficiencia_pct = serializers.FloatField()

    # Lista anidada de requerimientos
    requerimientos_lista = RequirementSerializer(many=True)