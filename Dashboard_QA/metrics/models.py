# metrics/models.py
from django.db import models
from django.core.exceptions import ValidationError
from decimal import Decimal

class Developer(models.Model):
    """Representa a cada desarrollador en el equipo."""
    name = models.CharField(max_length=100, verbose_name="Nombre Completo")
    email = models.EmailField(unique=True, verbose_name="Correo Electrónico")
    
    class RolChoices(models.TextChoices):
        DBA = 'DBA', 'Administrador de Base de Datos'
        DBA_BECARIO = 'DBA_Becario', 'Becario DBA'
        DEV_JUNIOR = 'DEV_Junior', 'Desarrollador Junior'
        DEV_SENIOR = 'DEV_Senior', 'Desarrollador Senior'
        QA_JUNIOR = 'QA_Junior', 'QA Junior'
        QA_SENIOR = 'QA_Senior', 'QA Senior'

    rol = models.CharField(
        max_length=20,
        choices=RolChoices.choices,
        default=RolChoices.DEV_JUNIOR,
        verbose_name='Rol'
    )

    def __str__(self):
        return f"{self.name} | {self.get_rol_display()}"
    
    class Meta:
        verbose_name = "Desarrollador"
        verbose_name_plural = "Desarrolladores"

class Requirement(models.Model):
    """Representa un requerimiento (ticket de Jira) con sus métricas de calidad."""
    
    developer = models.ForeignKey(
        Developer, 
        on_delete=models.CASCADE, 
        related_name='requirements',
        verbose_name="Desarrollador Asignado"
    )
    jira_ticket = models.CharField(max_length=250, unique=True, verbose_name="Ticket de Jira")
    description = models.TextField(verbose_name="Descripción")
    is_qa_approved = models.BooleanField(default=False, verbose_name="¿Aprobado por QA?")
    
    # Campo nuevo: Cantidad de veces que QA rechazó el ticket
    rejection_count = models.PositiveIntegerField(default=0, verbose_name="Cant. Rechazos QA")
    
    date_completed = models.DateField(auto_now_add=True, verbose_name="Fecha de Registro")

    # 1. Pruebas Unitarias
    unit_tests_total = models.PositiveIntegerField(default=0, verbose_name="Total Unitarias")
    unit_tests_passed = models.PositiveIntegerField(default=0, verbose_name="Unitarias Pasadas")
    unit_tests_failed = models.PositiveIntegerField(default=0, verbose_name="Unitarias Fallidas", editable=False)

    # 2. Métricas de Tiempo (9 horas laborales)
    estimated_effort_hours = models.DecimalField(
        max_digits=6, decimal_places=2, default=0.0, verbose_name="Esfuerzo Estimado (Hrs)"
    )
    start_date_real = models.DateField(null=True, blank=True, verbose_name="Fecha Inicio Real")
    end_date_real = models.DateField(null=True, blank=True, verbose_name="Fecha Fin Real")

    # 3. Métricas QA
    functional_cases = models.PositiveIntegerField(default=0, verbose_name="Casos Funcionales")
    functional_bugs = models.PositiveIntegerField(default=0, verbose_name="Bugs Funcionales")
    integration_cases = models.PositiveIntegerField(default=0, verbose_name="Casos Integración")
    integration_bugs = models.PositiveIntegerField(default=0, verbose_name="Bugs Integración")
    regression_cases = models.PositiveIntegerField(default=0, verbose_name="Casos Regresión")
    regression_bugs = models.PositiveIntegerField(default=0, verbose_name="Bugs Regresión")
    production_bugs = models.PositiveIntegerField(default=0, verbose_name="Bugs en Producción")

    def clean(self):
        if self.unit_tests_passed > self.unit_tests_total:
            raise ValidationError("Las pruebas pasadas no pueden exceder el total.")

    def save(self, *args, **kwargs):
        # Cálculo automático de fallidas
        if self.unit_tests_total > 0:
            self.unit_tests_failed = self.unit_tests_total - self.unit_tests_passed
        else:
            self.unit_tests_failed = 0
        super().save(*args, **kwargs)

    # --- PROPIEDADES CALCULADAS (Necesarias para Admin y Serializers) ---

    @property
    def unit_test_success_rate(self):
        if self.unit_tests_total == 0: return 0.0
        return round((self.unit_tests_passed / self.unit_tests_total) * 100, 2)

    @property
    def real_effort_days(self):
        if self.start_date_real and self.end_date_real: 
            if self.end_date_real >= self.start_date_real:
                delta = self.end_date_real - self.start_date_real
                return delta.days + 1
        return 0

    @property
    def real_effort_hours(self):
        # Jornada de 9 Horas
        return self.real_effort_days * 9

    @property
    def hours_diff(self):
        """Diferencia: Estimado - Real. (Positivo = Ahorró tiempo, Negativo = Tardó más)"""
        # Convertimos a Decimal para evitar error de tipos si django trae float
        return Decimal(self.estimated_effort_hours) - Decimal(self.real_effort_hours)

    @property
    def deviation_percentage(self):
        """Porcentaje de desvío para el Admin."""
        if self.estimated_effort_hours == 0:
            return 0
        # ((Estimado - Real) / Estimado) * 100
        return round((self.hours_diff / Decimal(self.estimated_effort_hours)) * 100, 2)

    @property
    def extra_hours_used(self):
        """Si tardó más de lo estimado, devuelve cuántas horas extra usó."""
        if self.hours_diff < 0:
            return abs(self.hours_diff)
        return 0

    def __str__(self):
        return f"{self.jira_ticket} - {self.developer.name}"