from django.contrib import admin
from .models import Developer, Requirement
from django.utils.html import format_html

@admin.register(Developer)
class DeveloperAdmin(admin.ModelAdmin):
    list_display = ('name', 'rol', 'email')
    list_filter = ('rol',)

@admin.register(Requirement)
class RequirementAdmin(admin.ModelAdmin):
    # Campos que se muestran en la tabla principal
    list_display = (
        'jira_ticket', 
        'developer', 
        'qa_status_colored', 
        'unit_test_summary',
        'effort_summary',
        'deviation_colored'
            ,'rejection_count'
    )
    
    # Filtros laterales
    list_filter = ('developer', 'is_qa_approved', 'date_completed')
    
    # Búsqueda
    search_fields = ('jira_ticket', 'description', 'developer__name')

    # Agrupar campos en el formulario de edición
    fieldsets = (
        ('Información General', {
            'fields': ('jira_ticket', 'developer', 'description', 'is_qa_approved', 'rejection_count')
        }),
        ('Calidad de Código (Dev)', {
            'fields': ('unit_tests_total', 'unit_tests_passed', 'unit_tests_failed'),
            'description': 'Ingresa Total y Pasadas. Las Fallidas se calculan solas al guardar.'
        }),
        ('Esfuerzo y Tiempo', {
            'fields': ('estimated_effort_hours', 'start_date_real', 'end_date_real'),
        }),
        ('Métricas de QA (Tus Hallazgos)', {
            'fields': (
                ('functional_cases', 'functional_bugs'),
                ('integration_cases', 'integration_bugs'),
                ('regression_cases', 'regression_bugs'),
                'production_bugs'
            )
        }),
    )
    
    # Campos de solo lectura (calculados)
    readonly_fields = ('unit_tests_failed',)

    # --- Funciones para colorear y formatear en el Admin ---

    def qa_status_colored(self, obj):
        color = 'green' if obj.is_qa_approved else 'orange'
        text = 'APROBADO' if obj.is_qa_approved else 'PENDIENTE'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', color, text)
    qa_status_colored.short_description = "Estado QA"

    def unit_test_summary(self, obj):
        return f"{obj.unit_test_success_rate}% ({obj.unit_tests_failed} fallidas)"
    unit_test_summary.short_description = "Pruebas Unitarias"

    def effort_summary(self, obj):
        return f"Est: {obj.estimated_effort_hours}h | Real: {obj.real_effort_hours}h"
    effort_summary.short_description = "Esfuerzo (9h/día)"

    def deviation_colored(self, obj):
        val = obj.deviation_percentage
        # Si es negativo (ej -20%) significa que tardó más -> Rojo
        # Si es positivo (ej 10%) significa que terminó antes -> Verde
        color = 'red' if val < 0 else 'green'
        return format_html('<span style="color: {};">{}% ({}h extra)</span>', color, val, obj.extra_hours_used)
    deviation_colored.short_description = "Desvío / Extras"